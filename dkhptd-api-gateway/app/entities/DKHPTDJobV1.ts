import crypto from "crypto";
import { ObjectId } from "mongodb";
import toObjectId from "../utils/toObjectId";
import ObjectModifer from "../modifiers/ObjectModifier";
import { c } from "../utils/cypher";
import BaseEntity from "./BaseEntity";
import JobStatus from "../configs/JobStatus";
import cfg from "../cfg";

export default class DKHPTDJobV1 extends BaseEntity {
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
    super(_id);
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
    const dPassword = c(cfg.JOB_ENCRYPTION_KEY).d(this.password, this.iv);
    const dUsername = c(cfg.JOB_ENCRYPTION_KEY).d(this.username, this.iv);
    return new DKHPTDJobV1({
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
    const ePassword = c(cfg.JOB_ENCRYPTION_KEY).e(this.password, iv);
    const eUsername = c(cfg.JOB_ENCRYPTION_KEY).e(this.username, iv);
    return new DKHPTDJobV1({
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
    const output = new DKHPTDJobV1(this);
    output._id = null;
    output.status = JobStatus.READY;
    output.doingAt = null;
    output.createdAt = Date.now();
    return output;
  }

  toWorker() {
    return {
      id: this._id.toHexString(),
      name: "DangKyHocPhanTuDong",
      params: {
        username: this.username,
        password: this.password,
        classIds: this.classIds,
      }
    };
  }
}
