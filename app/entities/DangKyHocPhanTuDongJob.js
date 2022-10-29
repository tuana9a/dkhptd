const toObjectId = require("../dto/toObjectId");
const toSafeArray = require("../dto/toSafeArray");
const toSafeInt = require("../dto/toSafeInt");
const toSafeString = require("../dto/toSafeString");
const DropProps = require("../modifiers/DropProps");
const ObjectModifer = require("../modifiers/ObjectModifier");
const EntityWithObjectId = require("./EntityWithObjectId");

class DangKyHocPhanTuDongJob extends EntityWithObjectId {
  constructor({ _id, username, password, classIds, timeToStart, workerId, ownerAccountId, status, createdAt, logs }) {
    super();
    this._id = _id;
    this.workerId = workerId;
    this.ownerAccountId = ownerAccountId;
    this.username = toSafeString(username);
    this.password = toSafeString(password);
    this.classIds = toSafeArray(classIds);
    this.timeToStart = toSafeInt(timeToStart);
    this.status = status;
    this.createdAt = toSafeInt(createdAt);
    this.logs = toSafeArray(logs); // log result
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
