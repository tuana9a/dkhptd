export default class DKHPTDJob {
  _id?: string;
  ownerAccountId: string;
  username: string;
  password: string;
  classIds: string[];
  timeToStart?: number;
  status: number;
  createdAt?: number;
  doingAt?: number;

  constructor({ _id, username, password, classIds, timeToStart, ownerAccountId, status, createdAt, doingAt }: {
    _id?: string;
    ownerAccountId: string;
    username: string;
    password: string;
    classIds: string[];
    timeToStart?: number;
    status: number;
    createdAt?: number;
    doingAt?: number;
  }) {
    this._id = _id;
    this.ownerAccountId = ownerAccountId;
    this.username = username;
    this.password = password;
    this.classIds = classIds;
    this.timeToStart = timeToStart;
    this.status = status;
    this.createdAt = createdAt;
    this.doingAt = doingAt;
  }
}
