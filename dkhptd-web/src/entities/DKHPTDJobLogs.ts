import ActionLog from "./ActionLog";

export default class DKHPTDJobLogs {
  _id: string;
  jobId: string;
  workerId?: string;
  ownerAccountId?: string;
  logs: ActionLog[];
  createdAt?: number;

  constructor({ _id, jobId, ownerAccountId, workerId, logs, createdAt }: {
    _id: string;
    jobId: string;
    ownerAccountId?: string;
    workerId?: string;
    logs: ActionLog[];
    createdAt?: number;
  }) {
    this._id = _id;
    this.jobId = jobId;
    this.workerId = workerId;
    this.ownerAccountId = ownerAccountId;
    this.logs = logs;
    this.createdAt = createdAt;
  }
}
