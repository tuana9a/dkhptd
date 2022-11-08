import crypto from "crypto";
import { ObjectId } from "mongodb";
import toObjectId from "../dto/toObjectId";
import ObjectModifer from "../modifiers/ObjectModifier";
import { d, e } from "../utils/cypher";
import DangKyHocPhanTuDongJob from "./DangKyHocPhanTuDongJob";
import EntityWithObjectId from "./EntityWithObjectId";
import JobStatus from "./JobStatus";

export default class DangKyHocPhanTuDongJobV1 extends EntityWithObjectId {
  ownerAccountId: ObjectId;
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;
  status: number;
  createdAt: number;
  doingAt: number;
  iv: string;

  constructor({ _id, username, password, classIds, timeToStart, ownerAccountId, status, createdAt, doingAt, iv }: {
    _id?: ObjectId;
    username?: string;
    password?: string;
    classIds?: string[];
    timeToStart?: number;
    ownerAccountId?: ObjectId;
    status?: number;
    createdAt?: number;
    doingAt?: number;
    iv?: string;
  }) {
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
    this.iv = iv;
  }

  withOwnerAccountId(id: string | ObjectId) {
    this.ownerAccountId = toObjectId(id);
    return this;
  }

  toClient() {
    return new ObjectModifer(this).collect();
  }

  decrypt() {
    const dPassword = d(this.password, this.iv);
    const dUsername = d(this.username, this.iv);
    return new DangKyHocPhanTuDongJob({
      _id: this._id,
      ownerAccountId: this.ownerAccountId,
      username: dUsername,
      password: dPassword,
      classIds: this.classIds,
      timeToStart: this.timeToStart,
      createdAt: this.createdAt,
      doingAt: this.doingAt,
      status: this.status,
    });
  }

  encrypt() {
    const iv = crypto.randomBytes(16).toString("hex");
    const ePassword = e(this.password, iv);
    const eUsername = e(this.username, iv);
    return new DangKyHocPhanTuDongJobV1({
      _id: this._id,
      ownerAccountId: this.ownerAccountId,
      username: eUsername,
      password: ePassword,
      classIds: this.classIds,
      timeToStart: this.timeToStart,
      createdAt: this.createdAt,
      doingAt: this.doingAt,
      status: this.status,
      iv: iv,
    });
  }

  toRetry() {
    const output = new DangKyHocPhanTuDongJobV1(this);
    output._id = null;
    output.status = JobStatus.READY;
    output.doingAt = null;
    output.createdAt = Date.now();
    return output;
  }
}
