import { ObjectId } from "mongodb";
import toObjectId from "../utils/toObjectId";
import EntityWithObjectId from "./EntityWithObjectId";
import { ActionLog } from "puppeteer-worker-job-builder/v1";

export default class DKHPTDJobLogs extends EntityWithObjectId {
  jobId: ObjectId;
  workerId: string;
  ownerAccountId: ObjectId;
  logs: ActionLog[];
  createdAt: number;

  constructor({ _id, jobId, ownerAccountId, workerId, logs, createdAt }: {
    _id?: ObjectId;
    jobId?: ObjectId;
    ownerAccountId?: ObjectId;
    workerId?: string;
    logs?: ActionLog[];
    createdAt?: number
  }) {
    super(_id);
    this.jobId = jobId;
    this.workerId = workerId;
    this.ownerAccountId = ownerAccountId;
    this.logs = logs;
    this.createdAt = createdAt;
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
}
