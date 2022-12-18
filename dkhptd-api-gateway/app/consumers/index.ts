import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import ExchangeName from "../configs/ExchangeName";
import QueueName from "../configs/QueueName";
import rabbitmqConnectionPool from "../connections/RabbitMQConnectionPool";
import bus from "../bus";
import logger from "../loggers/logger";
import { c } from "../utils/cypher";

export default {
  setup() {
    rabbitmqConnectionPool.getChannel().assertQueue(QueueName.PROCESS_JOB_RESULT, {}, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(msg.content.toString());
          bus.emit(AppEvent.NEW_JOB_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });

    rabbitmqConnectionPool.getChannel().assertQueue(QueueName.PROCESS_JOB_V1_RESULT, {}, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(c(cfg.AMQP_ENCRYPTION_KEY).d(msg.content.toString(), msg.properties.headers.iv));
          bus.emit(AppEvent.NEW_JOB_V1_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });

    rabbitmqConnectionPool.getChannel().assertQueue(QueueName.PROCESS_JOB_V2_RESULT, {}, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(c(cfg.AMQP_ENCRYPTION_KEY).d(msg.content.toString(), msg.properties.headers.iv));
          bus.emit(AppEvent.NEW_JOB_V2_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });

    rabbitmqConnectionPool.getChannel().assertQueue(QueueName.PROCESS_PARSE_TKB_XLSX_RESULT, {}, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(msg.content.toString());
          bus.emit(AppEvent.TKB_XLSX_PARSED, result);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });

    rabbitmqConnectionPool.getChannel().assertQueue("", { autoDelete: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().bindQueue(q.queue, ExchangeName.WORKER_DOING, "");
      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const doing = JSON.parse(msg.content.toString());
          bus.emit(AppEvent.WORKER_DOING, doing);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });

    rabbitmqConnectionPool.getChannel().assertQueue("", { autoDelete: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().bindQueue(q.queue, ExchangeName.WORKER_PING, "");
      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const ping = JSON.parse(msg.content.toString());
          bus.emit(AppEvent.WORKER_PING, ping);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });
  }
};
