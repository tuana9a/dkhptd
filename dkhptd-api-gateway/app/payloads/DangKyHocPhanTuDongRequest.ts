export default class DangKyHocPhanTuDongRequest {
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
