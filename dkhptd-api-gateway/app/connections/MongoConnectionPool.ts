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

const mongoConnectionPool = new MongoConnectionPool();

export default mongoConnectionPool;
