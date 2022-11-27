import http from "http";
import crypto from "crypto";
import express from "express";
import * as amqplib from "amqplib/callback_api";
import EventEmitter from "events";

import toJson from "./utils/toJson";
import toBuffer from "./utils/toBuffer";
import cfg from "./cfg";
import logger from "./loggers/logger";
import toKeyValueString from "./utils/toKeyValueString";
import { c } from "./utils/cypher";
import AppEvent from "./configs/AppEvent";
import ExchangeName from "./configs/ExchangeName";
import QueueName from "./configs/QueueName";

const app = express();
const server = http.createServer(app);
const emitter = new EventEmitter();

app.use(express.json());

emitter.on(AppEvent.NEW_JOB_RESULT, async (result) => {
  try {
    logger.info(`Received Job Result: ${result.id} ${toJson(result.logs, 2)}`);
  } catch (err) {
    logger.error(err);
  }
});

emitter.on(AppEvent.NEW_JOB_V1_RESULT, async (result) => {
  try {
    logger.info(`Received Job Result: ${result.id} ${toJson(result.logs, 2)}`);
  } catch (err) {
    logger.error(err);
  }
});

app.post("/api/test/job/new", (req, resp) => {
  const job = req.body;
  emitter.emit(AppEvent.NEW_JOB, job);
  resp.send(job);
});

app.post("/api/test/v1/job/new", (req, resp) => {
  const job = req.body;
  emitter.emit(AppEvent.NEW_JOB_V1, job);
  resp.send(job);
});

amqplib.connect(cfg.RABBITMQ_CONNECTION_STRING, (error0, connection) => {
  if (error0) {
    logger.error(error0);
    return;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      logger.error(error1);
      return;
    }
    emitter.on(AppEvent.NEW_JOB, (job) => {
      logger.info("New Job: " + toJson(job));
      channel.sendToQueue(QueueName.DKHPTD_JOBS, toBuffer(toJson(job)));
    });

    emitter.on(AppEvent.NEW_JOB_V1, (job) => {
      logger.info("New Job: " + toJson(job));
      const iv = crypto.randomBytes(16).toString("hex");
      channel.sendToQueue(QueueName.DKHPTD_JOBS_V1, toBuffer(c(cfg.AMQP_ENCRYPTION_KEY).e(toJson(job), iv)), {
        headers: {
          iv: iv,
        }
      });
    });

    channel.assertQueue(QueueName.DKHPTD_JOBS);
    channel.assertQueue(QueueName.DKHPTD_JOBS_V1);
    channel.assertExchange(ExchangeName.DKHPTD_WORKER_DOING, "fanout", { durable: false });
    channel.assertExchange(ExchangeName.DKHPTD_WORKER_PING, "fanout", { durable: false });

    // result queue
    channel.assertQueue(QueueName.DKHPTD_JOBS_RESULT, null, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(msg.content.toString());
          emitter.emit(AppEvent.NEW_JOB_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    channel.assertQueue(QueueName.DKHPTD_JOBS_V1_RESULT, null, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(c(cfg.AMQP_ENCRYPTION_KEY).d(msg.content.toString(), msg.properties.headers.iv));
          emitter.emit(AppEvent.NEW_JOB_V1_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    channel.assertQueue("", { exclusive: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.bindQueue(q.queue, ExchangeName.DKHPTD_WORKER_PING, "");
      channel.consume(q.queue, async (msg) => {
        try {
          const ping = JSON.parse(msg.content.toString());
          emitter.emit(AppEvent.PING, ping);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    channel.assertQueue("", { exclusive: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.bindQueue(q.queue, ExchangeName.DKHPTD_WORKER_DOING, "");
      channel.consume(q.queue, async (msg) => {
        try {
          const doing = JSON.parse(msg.content.toString());
          emitter.emit(AppEvent.DOING, doing);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });
  });
});

emitter.on(AppEvent.DOING, (doing) => logger.info(`Doing: ${toJson(doing, 2)}`));
emitter.on(AppEvent.PING, (ping) => logger.info(`Ping: ${toJson(ping)}`));

logger.info(`Config: \n${toKeyValueString(cfg)}`);
server.listen(cfg.PORT);
