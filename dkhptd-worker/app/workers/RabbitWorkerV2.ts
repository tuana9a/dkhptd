import amqp from "amqplib/callback_api";
import { DoingInfo, toPrettyErr } from "puppeteer-worker-job-builder";
import { Component } from "tu9nioc";
import crypto from "crypto";
import { cfg, ExchangeName, QueueName } from "../configs";
import { PuppeteerWorkerController } from "../controllers";
import { c } from "../cypher";
import logger from "../logger";
import { toJson, toBuffer } from "../utils";


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
