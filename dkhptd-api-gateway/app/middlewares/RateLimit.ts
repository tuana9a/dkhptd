import { Handler } from "express";
import ratelimit from "express-rate-limit";

export default ({ windowMs, max, handler }: { windowMs: number; max: number, handler?: Handler }) => ratelimit({
  windowMs: windowMs,
  max: max,
  handler: handler,
});
