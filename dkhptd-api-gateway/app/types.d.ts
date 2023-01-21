declare global {
  namespace Express {
    export interface Request {
      __accountId: string;
      __termId: string;
    }
  }
}

export type PrimitiveType = null | undefined | number | string | boolean | object;
