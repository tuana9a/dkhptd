class SupportJobsDb {
  db;

  constructor() {
    this.db = new Map();
  }

  getDb() {
    return this.db;
  }

  update(name, job) {
    this.db.set(name, job);
  }

  get(name) {
    return this.db.get(name);
  }
}

module.exports = SupportJobsDb;
