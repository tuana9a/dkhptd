import crypto from "crypto";
import { ObjectId } from "mongodb";
import { toObjectId } from "../to";
import { c } from "../cypher";
import BaseEntity from "./BaseEntity";
import { cfg, JobStatus } from "../cfg";

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
  no: number; // lần thực thí thứ n

  constructor(o: {
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
    no?: number;
  }) {
    super(o._id);
    this.ownerAccountId = o.ownerAccountId;
    this.username = o.username;
    this.password = o.password;
    this.classIds = o.classIds;
    this.timeToStart = o.timeToStart;
    this.status = o.status;
    this.createdAt = o.createdAt;
    this.doingAt = o.doingAt || -1;
    this.iv = o.iv;
    this.no = o.no || 0;
  }

  withOwnerAccountId(id: string | ObjectId) {
    this.ownerAccountId = toObjectId(id);
    return this;
  }

  toClient() {
    return this;
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
      no: this.no,
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
}
