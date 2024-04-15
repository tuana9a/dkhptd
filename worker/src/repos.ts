import { JobSupplier } from "./types";

export class SupportJobsDb {
  db: Map<string, JobSupplier>;

  constructor() {
    this.db = new Map();
  }

  getDb() {
    return this.db;
  }

  update(name: string, job: JobSupplier) {
    this.db.set(name, job);
  }

  get(name: string) {
    return this.db.get(name);
  }
}
