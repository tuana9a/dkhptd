export class AccountHasStudent {
  _id: string;
  accountId: string;
  studentId: string;

  constructor(o: {
    _id: string;
    accountId: string;
    studentId: string;
  }) {
    this._id = o._id;
    this.accountId = o.accountId;
    this.studentId = o.studentId;
  }
}

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

  constructor(o: {
    _id?: string;
    username: string;
    name?: string;
    password: string;
  }) {
    this._id = o._id;
    this.username = o.username;
    this.name = o.name;
    this.password = o.password;
  }
}

/** @deprecated */
export class BaseEntity {
  _id: string;

  constructor(_id: string) {
    this._id = _id;
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

/** @deprecated */
export class DKHPTDJobLogs {
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

/** @deprecated */
export class DKHPTDJobV1Logs {
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

export class DKHPTDJobV1 {
  _id: string;
  ownerAccountId: string;
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;
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
    this.status = o.status;
    this.createdAt = o.createdAt;
    this.doingAt = o.doingAt || -1;
    this.iv = o.iv;
    this.no = o.no || 0;
    this.termId = o.termId;
  }
}

/** @deprecated */
export class DKHPTDJobV2Logs {
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

export class DKHPTDResult {
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

export class DKHPTDV1Result {
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

export class DKHPTDV2Result {
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

export class StudentRegisterClassPreference {
  studentId: string;
  termId: string;
  wantedSubjectIds: string[];

  constructor(o: {
    studentId: string;
    termId: string;
    wantedSubjectIds: string[];
  }) {
    this.studentId = o.studentId;
    this.termId = o.termId;
    this.wantedSubjectIds = o.wantedSubjectIds;
  }
}

export class Student {
  studentId: string;
  email: string;

  constructor(o: {
    studentId: string;
    email: string;
  }) {

    this.studentId = o.studentId;
    this.email = o.email;
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
