const toObjectId = require("../dto/toObjectId");
const DropProps = require("../modifiers/DropProps");
const ObjectModifer = require("../modifiers/ObjectModifier");
const EntityWithObjectId = require("./EntityWithObjectId");

class DangKyHocPhanTuDongJob extends EntityWithObjectId {
  constructor({ _id, username, password, classIds, timeToStart, workerId, ownerAccountId, status, doingAt, createdAt, logs }) {
    super();
    this._id = _id;
    this.workerId = workerId;
    this.ownerAccountId = ownerAccountId;
    this.username = username;
    this.password = password;
    this.classIds = classIds;
    this.timeToStart = timeToStart;
    this.status = status;
    this.createdAt = createdAt;
    this.doingAt = doingAt;
    this.logs = logs;
  }

  withOwnerAccountId(id) {
    this.ownerAccountId = toObjectId(id);
  }

  withWorkerId(id) {
    this.workerId = id; // string
  }

  toClient() {
    const output = new ObjectModifer([DropProps(["password"])]).apply(this);
    return output;
  }
}

module.exports = DangKyHocPhanTuDongJob;
