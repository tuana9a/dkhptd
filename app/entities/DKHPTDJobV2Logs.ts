import { ObjectId } from "mongodb";
import { ActionLog } from "puppeteer-worker-job-builder/v1";
import cfg from "../cfg";
import { c } from "../utils/cypher";
import toObjectId from "../utils/toObjectId";
import DKHPTDJobLogs from "./DKHPTDJobLogs";
import BaseEntity from "./BaseEntity";

export default class DHKPTDJobV2Logs extends BaseEntity {
  jobId: ObjectId;
  workerId: string;
  ownerAccountId: ObjectId;
  logs: string; // encrypted
  iv: string;
  createdAt: number;

  constructor({ _id, jobId, ownerAccountId, workerId, logs, createdAt, iv }: {
    _id?: ObjectId;
    jobId?: ObjectId;
    ownerAccountId?: ObjectId;
    workerId?: string;
    logs?: string;
    createdAt?: number;
    iv?: string;
  }) {
    super(_id);
    this.jobId = jobId;
    this.workerId = workerId;
    this.ownerAccountId = ownerAccountId;
    this.logs = logs;
    this.createdAt = createdAt;
    this.iv = iv;
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
    const text = c(cfg.JOB_ENCRYPTION_KEY).d(this.logs, this.iv);
    const logs: ActionLog[] = JSON.parse(text);
    return new DKHPTDJobLogs({
      _id: this._id,
      jobId: this.jobId,
      ownerAccountId: this.ownerAccountId,
      workerId: this.workerId,
      logs: logs,
      createdAt: this.createdAt,
    });
  }
}
