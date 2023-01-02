import { Component } from "tu9nioc";
import { JobSupplier } from "./types";

@Component("supportJobsDb", { ignoreDeps: ["db"] })
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
