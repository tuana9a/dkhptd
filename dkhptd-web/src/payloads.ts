export class BaseResponse<T> {
  code?: number;
  message?: string;
  data?: T;
  error?: unknown;
  success?: boolean;
}

export class LoginResponse {
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}
