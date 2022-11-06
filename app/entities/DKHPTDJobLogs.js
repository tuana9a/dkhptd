const toObjectId = require("../dto/toObjectId");
const EntityWithObjectId = require("./EntityWithObjectId");

class DHPTDJobLogs extends EntityWithObjectId {
  constructor({ _id, jobId, ownerAccountId, workerId, logs, createdAt }) {
    super();
    this._id = _id;
    this.jobId = jobId;
    this.workerId = workerId;
    this.ownerAccountId = ownerAccountId;
    this.createdAt = createdAt;
    this.logs = logs;
  }

  withJobId(id) {
    this.jobId = toObjectId(id);
    return this;
  }

  withOwnerAccountId(id) {
    this.ownerAccountId = toObjectId(id);
    return this;
  }

  toClient() {
    return this;
  }
}

module.exports = DHPTDJobLogs;
