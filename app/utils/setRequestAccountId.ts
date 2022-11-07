import { Request } from "express";

export default (req: Request) => (accountId: string) => (req as any).__accountId = accountId;
