const toSafeArray = require("../dto/toSafeArray");
const toSafeInt = require("../dto/toSafeInt");
const toSafeString = require("../dto/toSafeString");

class DangKyHocPhanTuDongRequest {
  constructor({ username, password, classIds, timeToStart }) {
    this.username = toSafeString(username);
    this.password = toSafeString(password);
    this.classIds = toSafeArray(classIds);
    this.timeToStart = toSafeInt(timeToStart); // miliseconds
  }
}

module.exports = DangKyHocPhanTuDongRequest;
