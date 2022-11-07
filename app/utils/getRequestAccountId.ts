import { Request } from "express";

export default (req: Request): string => (req as any).__accountId;
