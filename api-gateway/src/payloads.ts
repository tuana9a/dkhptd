export class BaseResponse<T> {
  code: number;
  message: string;
  data: T;
  error: T;
  success: boolean;

  constructor() {
    this.message = null;
    this.data = null;
    this.success = false;
  }

  ok(data?: T) {
    this.success = true;
    this.data = data;
    return this;
  }

  failed(error?: T) {
    this.success = false;
    this.error = error;
    return this;
  }

  m(message: string) {
    this.message = message;
    return this;
  }

  c(code: number) {
    this.code = code;
    return this;
  }
}
export class DangKyHocPhanTuDongRequest {
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;

  constructor({ username, password, classIds, timeToStart }: {
    username?: string;
    password?: string;
    classIds?: string[];
    timeToStart?: number;
  }) {
    this.username = username;
    this.password = password;
    this.classIds = classIds;
    this.timeToStart = timeToStart; // miliseconds
  }
}
export class LoginResponse {
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}
export class LoginWithUsernamePasswordRequest {
  username: string;
  password: string;

  constructor({ username, password }) {
    this.username = username;
    this.password = password;
  }
}

export class ParsedClassToRegister {
  class_id: number;
  second_class_id: number;
  learn_day_number: number;
  class_type: string;
  subject_id: string;
  subject_name: string;
  learn_at_day_of_week: number;
  learn_time: string;
  learn_room: string;
  learn_week: string;
  describe: string;
  term_id: string;
  created_at: number;

  constructor(o: {
    class_id?: number;
    second_class_id?: number;
    learn_day_number?: number;
    class_type?: string;
    subject_id?: string;
    subject_name?: string;
    learn_at_day_of_week?: number;
    learn_time?: string;
    learn_room?: string;
    learn_week?: string;
    describe?: string;
    term_id?: string;
    created_at?: number;
  }) {
    this.term_id = o.term_id;
    this.class_id = o.class_id;
    this.second_class_id = o.second_class_id;
    this.class_type = o.class_type;
    this.subject_id = o.subject_id;
    this.subject_name = o.subject_name;
    this.learn_day_number = o.learn_day_number;
    this.learn_at_day_of_week = o.learn_at_day_of_week;
    this.learn_time = o.learn_time;
    this.learn_room = o.learn_room;
    this.learn_week = o.learn_week;
    this.describe = o.describe;
    this.created_at = o.created_at;
  }
}
