import amqp from "amqplib/callback_api";
import crypto from "crypto";
import logger from "../logger";
import { cfg, ExchangeName, QueueName } from "../configs";
import { PuppeteerWorkerController } from "../controllers";
import { c } from "../cypher";
import { toBuffer, toJson } from "../utils";
import { DoingInfo } from "../job-builder";

export class RabbitWorkerV1 {
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
        channel.assertQueue(QueueName.PROCESS_JOB_V1_RESULT, {});
        channel.assertQueue(QueueName.RUN_JOB_V1, {}, (error2, q) => {
          if (error2) {
            logger.error(error2);
            return process.exit(1);
          }
          channel.consume(q.queue, async (msg) => {
            const request = JSON.parse(c(cfg.amqpEncryptionKey).d(msg.content.toString(), msg.properties.headers.iv));
            logger.info(`Received ${msg.fields.routingKey} ${toJson(request, 2)}`);
            let onDoing = (doing: DoingInfo) => {
              channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({ workerId: cfg.id, doing })));
            };

            if (cfg.logWorkerDoing) {
              onDoing = (doing: DoingInfo) => {
                logger.info(`Doing ${request.id} ${toJson(doing, 2)}`);
                channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({ workerId: cfg.id, doing })));
              };
            }
            const { logs, vars } = await puppeteerWorkerController.do(request, onDoing);
            logger.info(`Logs ${request.id} ${toJson(logs, 2)}`);

            const newIv = crypto.randomBytes(16).toString("hex");
            const eResult = c(cfg.amqpEncryptionKey).e(toJson({
              id: request.id,
              workerId: cfg.id,
              logs,
              vars,
            }), newIv);

            channel.sendToQueue(QueueName.PROCESS_JOB_V1_RESULT, toBuffer(eResult), { headers: { iv: newIv } });
            channel.ack(msg);
          }, { noAck: false });
        });
        setInterval(() => channel.publish(ExchangeName.WORKER_PING, "", toBuffer(toJson({ workerId: cfg.id }))), 3000);
      });
    });
  }
}