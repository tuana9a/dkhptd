class BaseResponse {
  constructor() {
    this.message = null;
    this.data = null;
    this.success = false;
  }

  ok(data) {
    this.success = true;
    this.data = data;
    return this;
  }

  failed(data) {
    this.success = false;
    this.data = data;
    return this;
  }

  withMessage(message) {
    this.message = message;
    return this;
  }

  withData(data) {
    this.data = data;
    return this;
  }
}

module.exports = BaseResponse;
