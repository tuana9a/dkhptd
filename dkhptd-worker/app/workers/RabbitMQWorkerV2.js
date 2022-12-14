const amqp = require("amqplib/callback_api");
const crypto = require("crypto");
const toPrettyErr = require("../common/toPrettyErr");
const toBuffer = require("../common/toBuffer");
const logger = require("../loggers/logger");
const config = require("../config");
const { c } = require("../common/cypher");
const toJson = require("../common/toJson");
const QueueName = require("./QueueName");
const ExchangeName = require("./ExchangeName");

class RabbitMQWorkerV2 {
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
        channel.assertQueue(QueueName.PROCESS_JOB_V2_RESULT, {});
        channel.assertQueue(QueueName.RUN_JOB_V2, {}, (error2, q) => {
          if (error2) {
            logger.error(error2);
            return;
          }
          channel.consume(q.queue, async (msg) => {
            try {
              const job = JSON.parse(c(config.amqpEncryptionKey).d(msg.content.toString(), msg.properties.headers.iv));
              logger.info(`Received: ${msg.fields.routingKey} ${toJson(job, 2)}`);

              const logs = await puppeteerWorkerController.do(job, (doing) => {
                logger.info(`Doing: ${job.id} ${toJson(doing, 2)}`);
                channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({ workerId: config.workerId, doing })));
              });
              logger.info(`Logs: ${job.id} ${toJson(logs, 2)}`);

              const newIv = crypto.randomBytes(16).toString("hex");
              const eResult = c(config.amqpEncryptionKey).e(toJson({
                id: job.id,
                workerId: config.workerId,
                logs,
              }), newIv);

              channel.sendToQueue(QueueName.PROCESS_JOB_V2_RESULT, toBuffer(eResult), { headers: { iv: newIv } });
            } catch (err) {
              logger.error(err);

              const newIv = crypto.randomBytes(16).toString("hex");
              const eResult = c(config.amqpEncryptionKey).e(toJson({
                workerId: config.workerId,
                err: toPrettyErr(err),
              }), newIv);

              channel.sendToQueue(QueueName.PROCESS_JOB_V2_RESULT, toBuffer(eResult), { headers: { iv: newIv } });
            }
            channel.ack(msg);
          }, { noAck: false });
        });
        setInterval(() => channel.publish(ExchangeName.WORKER_PING, "", toBuffer(toJson({ workerId: config.workerId }))), 3000);
      });
    });
  }
}

module.exports = RabbitMQWorkerV2;
