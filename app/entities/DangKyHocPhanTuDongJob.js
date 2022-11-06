const toObjectId = require("../dto/toObjectId");
const DropProps = require("../modifiers/DropProps");
const ObjectModifer = require("../modifiers/ObjectModifier");
const EntityWithObjectId = require("./EntityWithObjectId");
const JobStatus = require("./JobStatus");

class DangKyHocPhanTuDongJob extends EntityWithObjectId {
  constructor({ _id, username, password, classIds, timeToStart, ownerAccountId, status, createdAt, doingAt }) {
    super();
    this._id = _id;
    this.ownerAccountId = ownerAccountId;
    this.username = username;
    this.password = password;
    this.classIds = classIds;
    this.timeToStart = timeToStart;
    this.status = status;
    this.createdAt = createdAt;
    this.doingAt = doingAt;
  }

  withOwnerAccountId(id) {
    this.ownerAccountId = toObjectId(id);
    return this;
  }

  toClient() {
    const output = new ObjectModifer([DropProps(["password"])]).apply(this);
    return output;
  }

  toRetry() {
    const output = new DangKyHocPhanTuDongJob(this);
    output._id = null;
    output.status = JobStatus.READY;
    output.doingAt = null;
    output.createdAt = Date.now();
    return output;
  }
}

module.exports = DangKyHocPhanTuDongJob;
