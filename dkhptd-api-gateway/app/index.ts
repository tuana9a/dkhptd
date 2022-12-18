import http from "http";
import express from "express";
import * as amqplib from "amqplib/callback_api";
import { MongoClient } from "mongodb";
import cors from "cors";

import cfg from "./cfg";
import logger from "./loggers/logger";
import toKeyValueString from "./utils/toKeyValueString";
import ExchangeName from "./configs/ExchangeName";
import QueueName from "./configs/QueueName";
import mongoConnectionPool from "./connections/MongoConnectionPool";
import routes from "./routes";
import backgrounds from "./backgrounds";
import listeners from "./listeners";
import consumers from "./consumers";
import rabbitmqConnectionPool from "./connections/RabbitMQConnectionPool";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(routes);

new MongoClient(cfg.MONGODB_CONNECTION_STRING).connect().then((client) => {
  mongoConnectionPool.addClient(client);
  backgrounds.setup();
  listeners.setup();
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
    rabbitmqConnectionPool.addChannel(channel);

    channel.assertQueue(QueueName.RUN_JOB, {});
    channel.assertQueue(QueueName.RUN_JOB_V1, {});
    channel.assertQueue(QueueName.RUN_JOB_V2, {});
    channel.assertQueue(QueueName.PARSE_TKB_XLSX, {});

    channel.assertExchange(ExchangeName.WORKER_DOING, "fanout", {});
    channel.assertExchange(ExchangeName.WORKER_PING, "fanout", {});

    consumers.setup();
  });
});

logger.info(`Config: \n${toKeyValueString(cfg)}`);
server.listen(cfg.PORT);
