import { ObjectId } from "mongodb";
import { toObjectId } from "../to";
import BaseEntity from "./BaseEntity";
import { JobStatus } from "../cfg";

export default class DKHPTDJob extends BaseEntity {
  ownerAccountId: ObjectId;
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;
  status: number;
  createdAt: number;
  doingAt: number;

  constructor({ _id, username, password, classIds, timeToStart, ownerAccountId, status, createdAt, doingAt }: {
    _id?: ObjectId;
    ownerAccountId?: ObjectId;
    username?: string;
    password?: string;
    classIds?: string[];
    timeToStart?: number;
    status?: number;
    createdAt?: number;
    doingAt?: number;
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
  }

  withOwnerAccountId(id: string | ObjectId) {
    this.ownerAccountId = toObjectId(id);
    return this;
  }

  toClient() {
    return this;
  }

  toRetry() {
    const output = new DKHPTDJob(this);
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
