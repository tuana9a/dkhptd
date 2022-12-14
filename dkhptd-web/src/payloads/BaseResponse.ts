export default class BaseResponse<T> {
  code?: number;
  message?: string;
  data?: T;
  error?: unknown;
  success?: boolean;
}
