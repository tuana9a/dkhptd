import { Job } from "./types";

export class AvailableJobs {
  db: Map<string, Job>;

  constructor() {
    this.db = new Map();
  }

  getDb() {
    return this.db;
  }

  update(name: string, job: Job) {
    this.db.set(name, job);
  }

  get(name: string) {
    return this.db.get(name);
  }
}
