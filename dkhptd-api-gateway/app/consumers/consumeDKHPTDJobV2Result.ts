import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import QueueName from "../configs/QueueName";
import rabbitmqConnectionPool from "../connections/RabbitMQConnectionPool";
import emitter from "../listeners/emiter";
import logger from "../loggers/logger";
import { c } from "../utils/cypher";

export default {
  setup() {
    rabbitmqConnectionPool.getChannel().assertQueue(QueueName.PROCESS_JOB_V2_RESULT, {}, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(c(cfg.AMQP_ENCRYPTION_KEY).d(msg.content.toString(), msg.properties.headers.iv));
          emitter.emit(AppEvent.NEW_JOB_V2_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });
  }
};
