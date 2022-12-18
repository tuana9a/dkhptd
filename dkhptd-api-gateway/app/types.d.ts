declare global {
  namespace Express {
    export interface Request {
      __accountId: string;
    }
  }
}

export {};
