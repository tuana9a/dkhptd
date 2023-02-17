import { ObjectId } from "mongodb";

export class AccountPreference {
  _id: ObjectId;
  termId: string;
  wantedSubjectIds: string[];
  ownerAccountId: ObjectId;

  constructor(o: {
    _id?: ObjectId;
    termId?: string;
    ownerAccountId: ObjectId;
    wantedSubjectIds?: string[];
  }) {
    this._id = o._id;
    this.termId = o.termId;
    this.wantedSubjectIds = o.wantedSubjectIds;
    this.ownerAccountId = o.ownerAccountId;
  }
}

export class Account {
  _id: ObjectId;
  username: string;
  name: string;
  password: string;

  constructor(o: {
    _id?: ObjectId;
    username?: string;
    name?: string;
    password?: string;
  }) {
    this._id = o._id;
    this.username = o.username;
    this.name = o.name;
    this.password = o.password;
  }
}

export class ClassToRegister {
  _id: ObjectId;
  classId: number;
  secondClassId: number;
  learnDayNumber: number;
  classType: string;
  subjectId: string;
  subjectName: string;
  learnAtDayOfWeek: number;
  learnTime: string;
  learnRoom: string;
  learnWeek: string;
  describe: string;
  termId: string;
  createdAt: number;

  constructor(o: {
    _id?: ObjectId;
    classId?: number;
    secondClassId?: number;
    learnDayNumber?: number;
    classType?: string;
    subjectId?: string;
    subjectName?: string;
    learnAtDayOfWeek?: number;
    learnTime?: string;
    learnRoom?: string;
    learnWeek?: string;
    describe?: string;
    termId?: string;
    createdAt?: number;
  }) {
    this._id = o._id;
    this.classId = o.classId;
    this.secondClassId = o.secondClassId;
    this.classType = o.classType;
    this.subjectId = o.subjectId;
    this.subjectName = o.subjectName;
    this.learnDayNumber = o.learnDayNumber;
    this.learnAtDayOfWeek = o.learnAtDayOfWeek;
    this.learnTime = o.learnTime;
    this.learnRoom = o.learnRoom;
    this.learnWeek = o.learnWeek;
    this.describe = o.describe;
    this.termId = o.termId;
    this.createdAt = o.createdAt;
  }
}

export class DKHPTDJob {
  _id: ObjectId;
  ownerAccountId: ObjectId;
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;
  status: number;
  createdAt: number;
  doingAt: number;

  constructor(o: {
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
    this._id = o._id;
    this.ownerAccountId = o.ownerAccountId;
    this.username = o.username;
    this.password = o.password;
    this.classIds = o.classIds;
    this.timeToStart = o.timeToStart;
    this.status = o.status;
    this.createdAt = o.createdAt;
    this.doingAt = o.doingAt;
  }
}

export class DKHPTDJobV1 {
  _id: ObjectId;
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
    this._id = o._id;
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
}

export class DKHPTDJobV2 {
  _id: ObjectId;
  ownerAccountId: ObjectId;
  username: string;
  password: string;
  classIds: string[][];
  timeToStart: number;
  status: number;
  createdAt: number;
  doingAt: number;
  iv: string;

  constructor(o: {
    _id?: ObjectId;
    username?: string;
    password?: string;
    classIds?: string[][];
    timeToStart?: number;
    ownerAccountId?: ObjectId;
    status?: number;
    createdAt?: number;
    doingAt?: number;
    iv?: string;
  }) {
    this._id = o._id;
    this.ownerAccountId = o.ownerAccountId;
    this.username = o.username;
    this.password = o.password;
    this.classIds = o.classIds;
    this.timeToStart = o.timeToStart;
    this.status = o.status;
    this.createdAt = o.createdAt;
    this.doingAt = o.doingAt;
    this.iv = o.iv;
  }
}

export class DKHPTDJobResult {
  _id: ObjectId;
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
    this._id = o._id;
    this.jobId = o.jobId;
    this.workerId = o.workerId;
    this.ownerAccountId = o.ownerAccountId;
    this.logs = o.logs;
    this.vars = o.vars;
    this.createdAt = o.createdAt;
  }
}

export class DKHPTDJobV1Result {
  _id: ObjectId;
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
    this._id = o._id;
    this.jobId = o.jobId;
    this.workerId = o.workerId;
    this.ownerAccountId = o.ownerAccountId;
    this.logs = o.logs;
    this.vars = o.vars;
    this.createdAt = o.createdAt;
    this.iv = o.iv;
  }
}

export class DKHPTDJobV2Result {
  _id: ObjectId;
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
    this._id = o._id;
    this.jobId = o.jobId;
    this.workerId = o.workerId;
    this.ownerAccountId = o.ownerAccountId;
    this.logs = o.logs;
    this.vars = o.vars;
    this.createdAt = o.createdAt;
    this.iv = o.iv;
  }
}

export class Timestamp {
  n: number;
  s: string;

  constructor(date = new Date()) {
    this.n = date.getTime();
    this.s = date.toString();
  }
}
