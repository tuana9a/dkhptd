export default class DKHPTDJobV1 {
  _id?: string;
  ownerAccountId?: string;
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;
  status: number;
  createdAt?: number;
  doingAt?: number;
  iv: string;

  constructor({ _id, username, password, classIds, timeToStart, ownerAccountId, status, createdAt, doingAt, iv }: {
    _id?: string;
    username: string;
    password: string;
    classIds: string[];
    timeToStart: number;
    ownerAccountId?: string;
    status: number;
    createdAt?: number;
    doingAt?: number;
    iv: string;
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
    this.iv = iv;
  }
}
