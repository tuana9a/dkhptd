import { ObjectId } from "mongodb";
import { toObjectId } from "../to";
import BaseEntity from "./BaseEntity";

export default class DKHPTDJobLogs extends BaseEntity {
  jobId: ObjectId;
  workerId: string;
  ownerAccountId: ObjectId;
  logs: [];
  vars: unknown;
  createdAt: number;

  constructor(o: {
    _id?: ObjectId;
    jobId?: ObjectId;
    ownerAccountId?: ObjectId;
    workerId?: string;
    logs?: [];
    createdAt?: number;
    vars?: unknown;
  }) {
    super(o._id);
    this.jobId = o.jobId;
    this.workerId = o.workerId;
    this.ownerAccountId = o.ownerAccountId;
    this.logs = o.logs;
    this.vars = o.vars;
    this.createdAt = o.createdAt;
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
