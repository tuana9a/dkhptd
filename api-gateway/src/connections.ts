import { Channel } from "amqplib/callback_api";
import { MongoClient } from "mongodb";

class MongoConnectionPool {
  clients: MongoClient[];
  currentClientIdx: number;

  constructor() {
    this.clients = [];
    this.currentClientIdx = 0;
  }

  addClient(client: MongoClient) {
    this.clients.push(client);
  }

  getClient() {
    return this.clients[this.currentClientIdx];
  }
}

export const mongoConnectionPool = new MongoConnectionPool();

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