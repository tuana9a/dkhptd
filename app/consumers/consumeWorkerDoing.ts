import AppEvent from "../configs/AppEvent";
import ExchangeName from "../configs/ExchangeName";
import rabbitmqConnectionPool from "../connections/RabbitMQConnectionPool";
import emitter from "../listeners/emiter";
import logger from "../loggers/logger";

export default {
  setup() {
    rabbitmqConnectionPool.getChannel().assertQueue("", { exclusive: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().bindQueue(q.queue, ExchangeName.DKHPTD_WORKER_DOING, "");
      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const doing = JSON.parse(msg.content.toString());
          emitter.emit(AppEvent.DOING, doing);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });
  }
};
