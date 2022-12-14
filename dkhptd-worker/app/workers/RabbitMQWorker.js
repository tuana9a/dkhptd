const amqp = require("amqplib/callback_api");
const toPrettyErr = require("../common/toPrettyErr");
const toBuffer = require("../common/toBuffer");
const logger = require("../loggers/logger");
const config = require("../config");
const toJson = require("../common/toJson");
const QueueName = require("./QueueName");
const ExchangeName = require("./ExchangeName");

class RabbitMQWorker {
  puppeteerWorkerController;

  start() {
    const puppeteerWorkerController = this.getPuppeteerWorkerController();
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

module.exports = RabbitMQWorker;
