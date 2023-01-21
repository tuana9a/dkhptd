import { ObjectId } from "mongodb";
import { cfg } from "../cfg";
import { c } from "../cypher";
import { toObjectId } from "../to";
import DKHPTDJobLogs from "./DKHPTDJobLogs";
import BaseEntity from "./BaseEntity";

export default class DKHPTDJobV1Logs extends BaseEntity {
  jobId: ObjectId;
  workerId: string;
  ownerAccountId: ObjectId;
  logs: string; // encrypted
  vars: string; // encrypted
  iv: string;
  createdAt: number;

  constructor(o: {
    _id?: ObjectId;
    jobId?: ObjectId;
    ownerAccountId?: ObjectId;
    workerId?: string;
    logs?: string;
    vars?: string;
    createdAt?: number;
    iv?: string;
  }) {
    super(o._id);
    this.jobId = o.jobId;
    this.workerId = o.workerId;
    this.ownerAccountId = o.ownerAccountId;
    this.logs = o.logs;
    this.vars = o.vars;
    this.createdAt = o.createdAt;
    this.iv = o.iv;
  }

  withJobId(id: string | ObjectId) {
    this.jobId = toObjectId(id);
    return this;
  }

  withOwnerAccountId(id: string | ObjectId) {
    this.ownerAccountId = toObjectId(id);
    return this;
  }

  toClient() {
    return this;
  }

  decrypt() {
    const logs: [] = this.logs ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(this.logs, this.iv)) : [];
    const vars = this.vars ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(this.vars, this.iv)) : {};
    return new DKHPTDJobLogs({
      _id: this._id,
      jobId: this.jobId,
      ownerAccountId: this.ownerAccountId,
      workerId: this.workerId,
      logs: logs,
      vars: vars,
      createdAt: this.createdAt,
    });
  }
}
