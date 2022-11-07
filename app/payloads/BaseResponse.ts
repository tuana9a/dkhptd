export default class BaseResponse<T> {
  message: string;
  data: T;
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

  failed(data?: T) {
    this.success = false;
    this.data = data;
    return this;
  }

  withMessage(message: string) {
    this.message = message;
    return this;
  }

  withData(data: T) {
    this.data = data;
    return this;
  }
}
