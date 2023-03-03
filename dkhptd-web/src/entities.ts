export const Role = {
  ADMIN: "ADMIN",
};

export class AccountPreference {
  _id?: string;
  termId: string;
  wantedSubjectIds: string[];
  ownerAccountId?: string;

  constructor(o: {
    _id?: string;
    termId: string;
    ownerAccountId?: string;
    wantedSubjectIds: string[];
  }) {
    this._id = o._id;
    this.termId = o.termId;
    this.wantedSubjectIds = o.wantedSubjectIds;
    this.ownerAccountId = o.ownerAccountId;
  }
}

export class Account {
  _id?: string;
  username: string;
  name?: string;
  password: string;
  role?: string;

  constructor(o: {
    _id?: string;
    username: string;
    name?: string;
    password: string;
    role?: string;
  }) {
    this._id = o._id;
    this.username = o.username;
    this.name = o.name;
    this.password = o.password;
    this.role = o.role;
  }
}

export class ClassToRegister {
  _id?: string;
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

  constructor(o: {
    _id?: string;
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
  _id: string;
  ownerAccountId: string;
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;
  status: number;
  createdAt: number;
  doingAt: number;

  constructor(o: {
    _id: string;
    ownerAccountId: string;
    username: string;
    password: string;
    classIds: string[];
    timeToStart: number;
    status: number;
    createdAt: number;
    doingAt: number;
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
  _id: string;
  ownerAccountId: string;
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;
  originTimeToStart: number;
  status: number;
  createdAt: number;
  doingAt: number;
  iv: string;
  no: number; // lần thực thí thứ n
  termId: string;

  constructor(o: {
    _id: string;
    username: string;
    password: string;
    classIds: string[];
    timeToStart: number;
    originTimeToStart: number;
    ownerAccountId: string;
    status: number;
    createdAt: number;
    doingAt: number;
    iv: string;
    no: number;
    termId: string;
  }) {
    this._id = o._id;
    this.ownerAccountId = o.ownerAccountId;
    this.username = o.username;
    this.password = o.password;
    this.classIds = o.classIds;
    this.timeToStart = o.timeToStart;
    this.originTimeToStart = o.originTimeToStart;
    this.status = o.status;
    this.createdAt = o.createdAt;
    this.doingAt = o.doingAt || -1;
    this.iv = o.iv;
    this.no = o.no || 0;
    this.termId = o.termId;
  }
}

export class DKHPTDJobV2 {
  _id: string;
  ownerAccountId: string;
  username: string;
  password: string;
  classIds: string[][];
  timeToStart: number;
  status: number;
  createdAt: number;
  doingAt: number;
  iv: string;

  constructor(o: {
    _id: string;
    username: string;
    password: string;
    classIds: string[][];
    timeToStart: number;
    ownerAccountId: string;
    status: number;
    createdAt: number;
    doingAt: number;
    iv: string;
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
  _id: string;
  jobId: string;
  workerId: string;
  ownerAccountId: string;
  logs: [];
  vars: any;
  createdAt: number;

  constructor(o: {
    _id: string;
    jobId: string;
    ownerAccountId: string;
    workerId: string;
    logs: [];
    createdAt: number;
    vars: any;
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
  _id: string;
  jobId: string;
  workerId: string;
  ownerAccountId: string;
  logs;
  vars;
  iv: string;
  createdAt: number;

  constructor(o: {
    _id: string;
    jobId: string;
    ownerAccountId: string;
    workerId: string;
    logs: any;
    vars: any;
    createdAt: number;
    iv: string;
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
  _id: string;
  jobId: string;
  workerId: string;
  ownerAccountId: string;
  logs;
  vars;
  iv: string;
  createdAt: number;

  constructor(o: {
    _id: string;
    jobId: string;
    ownerAccountId: string;
    workerId: string;
    logs: any;
    vars: any;
    createdAt: number;
    iv: string;
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

export class ActionLog {
  action?: string;

  type?: string;

  stepIdx?: number;

  nestingLevel?: number;

  nestingLogs?: ActionLog[];

  output?: object;

  error?: object;

  at?: number;
}
