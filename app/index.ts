import http from "http";
import express from "express";
import * as amqplib from "amqplib/callback_api";
import { MongoClient } from "mongodb";

import cfg from "./cfg";
import logger from "./loggers/logger";
import toKeyValueString from "./utils/toKeyValueString";
import AppEvent from "./configs/AppEvent";
import ExchangeName from "./configs/ExchangeName";
import QueueName from "./configs/QueueName";
import mongoConnectionPool from "./connections/MongoConnectionPool";
import routes from "./routes";
import emitter from "./listeners/emiter";
import backgroundSetup from "./backgrounds/setup";
import listenerSetup from "./listeners/setup";
import consumerSetup from "./consumers/setup";
import rabbitmqConnectionPool from "./connections/RabbitMQConnectionPool";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(routes);

new MongoClient(cfg.MONGODB_CONNECTION_STRING).connect().then((client) => {
  mongoConnectionPool.addClient(client);
  backgroundSetup.setup();
  listenerSetup.setup();
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

    channel.assertQueue(QueueName.DKHPTD_JOBS, { durable: false });
    channel.assertQueue(QueueName.DKHPTD_JOBS_V1, { durable: false });
    channel.assertQueue(QueueName.DKHPTD_JOBS_V2, { durable: false });
    channel.assertQueue(QueueName.DKHPTD_PARSE_CTR_XLSX_JOBS, { durable: false });

    channel.assertExchange(ExchangeName.DKHPTD_WORKER_DOING, "fanout", { durable: false });
    channel.assertExchange(ExchangeName.DKHPTD_WORKER_PING, "fanout", { durable: false });

    consumerSetup.setup();
  });
});

logger.info(`Config: \n${toKeyValueString(cfg)}`);
server.listen(cfg.PORT);
