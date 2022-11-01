const BaseResponse = require("../payloads/BaseResponse");
const SafeError = require("./SafeError");

class UsernameExistedError extends SafeError {
  constructor(username) {
    super("USERNAME_EXISTED");
    this.username = username;
  }

  toBaseResponse() {
    return new BaseResponse().failed(this.username).withMessage(this.message);
  }
}

module.exports = UsernameExistedError;
