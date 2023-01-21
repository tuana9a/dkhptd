import { Channel } from "amqplib/callback_api";

class RabbitMQConnectionPool {
  channels: Channel[];
  currentChannelIdx: number;


  constructor() {
    this.channels = [];
    this.currentChannelIdx = 0;
  }

  addChannel(channel: Channel) {
    this.channels.push(channel);
  }

  getChannel() {
    return this.channels[this.currentChannelIdx];
  }
}

export const rabbitmqConnectionPool = new RabbitMQConnectionPool();
