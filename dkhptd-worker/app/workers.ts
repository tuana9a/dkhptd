import fs from "fs";
import path from "path";
import oxias from "axios";
import amqp from "amqplib/callback_api";
import crypto from "crypto";
import loop from "./loop";
import logger from "./logger";
import { cfg, ExchangeName, QueueName } from "./configs";
import { PuppeteerWorkerController } from "./controllers";
import { Component } from "tu9nioc";
import { c } from "./cypher";
import { toBuffer, toJson, toPrettyErr } from "./utils";
import { ScheduleDirNotExistsError } from "./errors";
import { DoingInfo } from "puppeteer-worker-job-builder";

const axios = oxias.create();

@Component
export class HttpWorker {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  async start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    const httpWorkerConfig = await axios.get(cfg.httpWorkerPullConfigUrl, { headers: { Authorization: cfg.accessToken } }).then((res) => res.data);
    const { pollJobUrl, submitJobResultUrl, repeatPollJobsAfter } = httpWorkerConfig;
    loop.infinity(async () => {
      const jobInfo = await axios.get(pollJobUrl, { headers: { Authorization: cfg.accessToken } }).then((res) => res.data).catch((err) => logger.error(err));
      if (!jobInfo) {
        return;
      }
      try {
        const { logs, vars } = await puppeteerWorkerController.do(jobInfo);
        const body = { id: jobInfo.id, workerId: cfg.workerId, logs, vars };
        axios.post(submitJobResultUrl, toJson(body), {
          headers: {
            "Content-Type": "application/json",
            Authorization: cfg.accessToken,
          },
        }).catch((err) => logger.error(err));
      } catch (err) {
        logger.error(err);
        const body = { workerId: cfg.workerId, err: toPrettyErr(err) };
        axios.post(submitJobResultUrl, toJson(body), {
          headers: {
            "Content-Type": "application/json",
            Authorization: cfg.accessToken,
          },
        }).catch((err1) => logger.error(err1));
      }
    }, repeatPollJobsAfter);
  }
}

@Component
export class RabbitWorker {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    amqp.connect(cfg.rabbitmqConnectionString, (error0, connection) => {
      if (error0) {
        logger.error(error0);
        return;
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          logger.error(error1);
          return;
        }
        channel.prefetch(1);
        channel.assertExchange(ExchangeName.WORKER_PING, "fanout", {});
        channel.assertExchange(ExchangeName.WORKER_DOING, "fanout", {});
        channel.assertQueue(QueueName.PROCESS_JOB_RESULT, {});
        channel.assertQueue(QueueName.RUN_JOB, {}, (error2, q) => {
          if (error2) {
            logger.error(error2);
            return;
          }
          channel.consume(q.queue, async (msg) => {
            const job = JSON.parse(msg.content.toString());
            try {
              logger.info(`Received ${msg.fields.routingKey} ${toJson(job, 2)}`);
              const { logs, vars } = await puppeteerWorkerController.do(job, (doing: DoingInfo) => {
                logger.info(`Doing ${job.id} ${toJson(doing, 2)}`);
                channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({
                  workerId: cfg.workerId,
                  doing,
                })));
              });
              logger.info(`Logs ${job.id} ${toJson(logs, 2)}`);
              channel.sendToQueue(QueueName.PROCESS_JOB_RESULT, toBuffer(toJson({
                id: job.id,
                workerId: cfg.workerId,
                logs,
                vars,
              })));
            } catch (err) {
              logger.error(err);
              channel.sendToQueue(QueueName.PROCESS_JOB_RESULT, toBuffer(toJson({
                id: job.id,
                workerId: cfg.workerId,
                err: toPrettyErr(err),
              })));
            }
            channel.ack(msg);
          }, { noAck: false });
        });
        setInterval(() => channel.publish(ExchangeName.WORKER_PING, "", toBuffer(toJson({ workerId: cfg.workerId }))), 3000);
      });
    });
  }
}

@Component
export class RabbitWorkerV1 {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    amqp.connect(cfg.rabbitmqConnectionString, (error0, connection) => {
      if (error0) {
        logger.error(error0);
        return;
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          logger.error(error1);
          return;
        }
        channel.prefetch(1);
        channel.assertExchange(ExchangeName.WORKER_PING, "fanout", {});
        channel.assertExchange(ExchangeName.WORKER_DOING, "fanout", {});
        channel.assertQueue(QueueName.PROCESS_JOB_V1_RESULT, {});
        channel.assertQueue(QueueName.RUN_JOB_V1, {}, (error2, q) => {
          if (error2) {
            logger.error(error2);
            return;
          }
          channel.consume(q.queue, async (msg) => {
            const job = JSON.parse(c(cfg.amqpEncryptionKey).d(msg.content.toString(), msg.properties.headers.iv));
            try {
              logger.info(`Received ${msg.fields.routingKey} ${toJson(job, 2)}`);

              const { logs, vars } = await puppeteerWorkerController.do(job, (doing: DoingInfo) => {
                logger.info(`Doing ${job.id} ${toJson(doing, 2)}`);
                channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({ workerId: cfg.workerId, doing })));
              });
              logger.info(`Logs ${job.id} ${toJson(logs, 2)}`);

              const newIv = crypto.randomBytes(16).toString("hex");
              const eResult = c(cfg.amqpEncryptionKey).e(toJson({
                id: job.id,
                workerId: cfg.workerId,
                logs,
                vars,
              }), newIv);

              channel.sendToQueue(QueueName.PROCESS_JOB_V1_RESULT, toBuffer(eResult), { headers: { iv: newIv } });
            } catch (err) {
              logger.error(err);

              const newIv = crypto.randomBytes(16).toString("hex");
              const eResult = c(cfg.amqpEncryptionKey).e(toJson({
                id: job.id,
                workerId: cfg.workerId,
                err: toPrettyErr(err),
              }), newIv);

              channel.sendToQueue(QueueName.PROCESS_JOB_V1_RESULT, toBuffer(eResult), { headers: { iv: newIv } });
            }
            channel.ack(msg);
          }, { noAck: false });
        });
        setInterval(() => channel.publish(ExchangeName.WORKER_PING, "", toBuffer(toJson({ workerId: cfg.workerId }))), 3000);
      });
    });
  }
}

@Component
export class RabbitWorkerV2 {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    amqp.connect(cfg.rabbitmqConnectionString, (error0, connection) => {
      if (error0) {
        logger.error(error0);
        return;
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          logger.error(error1);
          return;
        }
        channel.prefetch(1);
        channel.assertExchange(ExchangeName.WORKER_PING, "fanout", {});
        channel.assertExchange(ExchangeName.WORKER_DOING, "fanout", {});
        channel.assertQueue(QueueName.PROCESS_JOB_V2_RESULT, {});
        channel.assertQueue(QueueName.RUN_JOB_V2, {}, (error2, q) => {
          if (error2) {
            logger.error(error2);
            return;
          }
          channel.consume(q.queue, async (msg) => {
            const job = JSON.parse(c(cfg.amqpEncryptionKey).d(msg.content.toString(), msg.properties.headers.iv));
            try {
              logger.info(`Received ${msg.fields.routingKey} ${toJson(job, 2)}`);

              const { logs, vars } = await puppeteerWorkerController.do(job, (doing: DoingInfo) => {
                logger.info(`Doing ${job.id} ${toJson(doing, 2)}`);
                channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({ workerId: cfg.workerId, doing })));
              });
              logger.info(`Logs ${job.id} ${toJson(logs, 2)}`);

              const newIv = crypto.randomBytes(16).toString("hex");
              const eResult = c(cfg.amqpEncryptionKey).e(toJson({
                id: job.id,
                workerId: cfg.workerId,
                logs,
                vars,
              }), newIv);

              channel.sendToQueue(QueueName.PROCESS_JOB_V2_RESULT, toBuffer(eResult), { headers: { iv: newIv } });
            } catch (err) {
              logger.error(err);

              const newIv = crypto.randomBytes(16).toString("hex");
              const eResult = c(cfg.amqpEncryptionKey).e(toJson({
                id: job.id,
                workerId: cfg.workerId,
                err: toPrettyErr(err),
              }), newIv);

              channel.sendToQueue(QueueName.PROCESS_JOB_V2_RESULT, toBuffer(eResult), { headers: { iv: newIv } });
            }
            channel.ack(msg);
          }, { noAck: false });
        });
        setInterval(() => channel.publish(ExchangeName.WORKER_PING, "", toBuffer(toJson({ workerId: cfg.workerId }))), 3000);
      });
    });
  }
}

@Component
export class StandaloneWorker {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  async start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    const dir = cfg.scheduleDir;

    if (!fs.existsSync(dir)) {
      throw new ScheduleDirNotExistsError(dir);
    }

    const files = fs.readdirSync(dir).filter((x) => x.endsWith(".json"));
    const schedules = [];

    for (const filepath of files) {
      const absoluteFilepath = path.resolve(dir, filepath);
      const job = JSON.parse(fs.readFileSync(absoluteFilepath, { flag: "r", encoding: "utf-8" }));
      logger.info(`Schedule ${toJson(job, 2)}`);
      schedules.push(job);
    }
    schedules.sort((x1, x2) => x1.timeToStart - x2.timeToStart);

    loop.infinity(async () => {
      const jobInfo = schedules[0];
      if (!jobInfo) process.exit(0); // empty job
      if (Date.now() < jobInfo.timeToStart) return; // not it's time yet
      schedules.shift();
      try {
        const output = await puppeteerWorkerController.do(jobInfo);
        logger.info(output);
      } catch (err) {
        logger.error(err);
      }
    }, 5000);
  }
}
