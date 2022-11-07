import ratelimit from "express-rate-limit";

export default ({ windowMs, max }: { windowMs: number; max: number }) => ratelimit({
  windowMs: windowMs,
  max: max,
});
