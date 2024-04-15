import amqp from "amqplib/callback_api";
import logger from "../logger";
import { cfg, ExchangeName, QueueName } from "../configs";
import { PuppeteerWorkerController } from "../controllers";
import { toBuffer, toJson } from "../utils";
import { DoingInfo } from "../job-builder";

export class RabbitWorker {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    amqp.connect(cfg.rabbitmqConnectionString, (error0, connection) => {
      if (error0) {
        logger.error(error0);
        return process.exit(1);
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          logger.error(error1);
          return process.exit(1);
        }
        channel.prefetch(1);
        channel.assertExchange(ExchangeName.WORKER_PING, "fanout", {});
        channel.assertExchange(ExchangeName.WORKER_DOING, "fanout", {});
        channel.assertQueue(QueueName.PROCESS_JOB_RESULT, {});
        channel.assertQueue(QueueName.RUN_JOB, {}, (error2, q) => {
          if (error2) {
            logger.error(error2);
            return process.exit(1);
          }
          channel.consume(q.queue, async (msg) => {
            const job = JSON.parse(msg.content.toString());
            logger.info(`Received ${msg.fields.routingKey} ${toJson(job, 2)}`);
            const { logs, vars } = await puppeteerWorkerController.do(job, (doing: DoingInfo) => {
              logger.info(`Doing ${job.id} ${toJson(doing, 2)}`);
              channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({
                workerId: cfg.id,
                doing,
              })));
            });
            logger.info(`Logs ${job.id} ${toJson(logs, 2)}`);
            channel.sendToQueue(QueueName.PROCESS_JOB_RESULT, toBuffer(toJson({
              id: job.id,
              workerId: cfg.id,
              logs,
              vars,
            })));
            channel.ack(msg);
          }, { noAck: false });
        });
        setInterval(() => channel.publish(ExchangeName.WORKER_PING, "", toBuffer(toJson({ workerId: cfg.id }))), 3000);
      });
    });
  }
}