export default class BaseResponse<T> {
  private code: number;
  private message: string;
  private data: T;
  private error: T;
  private success: boolean;

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

  msg(message: string) {
    this.message = message;
    return this;
  }

  codee(code: number) {
    this.code = code;
    return this;
  }
}
