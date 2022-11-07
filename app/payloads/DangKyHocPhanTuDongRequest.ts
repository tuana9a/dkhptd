import toSafeArray from "../dto/toSafeArray";
import toSafeInt from "../dto/toSafeInt";
import toSafeString from "../dto/toSafeString";

export default class DangKyHocPhanTuDongRequest {
  username: string;
  password: string;
  classIds: string[];
  timeToStart: number;

  constructor({ username, password, classIds, timeToStart }) {
    this.username = toSafeString(username);
    this.password = toSafeString(password);
    this.classIds = toSafeArray<string>(classIds);
    this.timeToStart = toSafeInt(timeToStart); // miliseconds
  }
}
