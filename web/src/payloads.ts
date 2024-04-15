export class BaseResponse<T> {
  code?: number;
  message?: string;
  data?: T;
  error?: unknown;
  success?: boolean;
}

export interface LoginResponse {
  token: string;
  username: string;
  password: string;
  role?: string;
}
