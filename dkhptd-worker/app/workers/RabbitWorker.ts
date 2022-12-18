import PuppeteerWorkerController from "../controllers/PuppeteerWorkerController";

import amqp from "amqplib/callback_api";
import toPrettyErr from "../common/toPrettyErr";
import toBuffer from "../common/toBuffer";
import logger from "../loggers/logger";
import config from "../config";
import toJson from "../common/toJson";
import QueueName from "../common/QueueName";
import ExchangeName from "../common/ExchangeName";
import { Component } from "tu9nioc";

@Component
export default class RabbitWorker {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    amqp.connect(config.rabbitmqConnectionString, (error0, connection) => {
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
            try {
              const job = JSON.parse(msg.content.toString());
              logger.info(`Received: ${msg.fields.routingKey} ${toJson(job, 2)}`);
              const logs = await puppeteerWorkerController.do(job, (doing) => {
                logger.info(`Doing: ${job.id} ${toJson(doing, 2)}`);
                channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({
                  workerId: config.workerId,
                  doing,
                })));
              });
              logger.info(`Logs: ${job.id} ${toJson(logs, 2)}`);
              channel.sendToQueue(QueueName.PROCESS_JOB_RESULT, toBuffer(toJson({
                id: job.id,
                workerId: config.workerId,
                logs,
              })));
            } catch (err) {
              logger.error(err);
              channel.sendToQueue(QueueName.PROCESS_JOB_RESULT, toBuffer(toJson({
                workerId: config.workerId,
                err: toPrettyErr(err),
              })));
            }
            channel.ack(msg);
          }, { noAck: false });
        });
        setInterval(() => channel.publish(ExchangeName.WORKER_PING, "", toBuffer(toJson({ workerId: config.workerId }))), 3000);
      });
    });
  }
}
