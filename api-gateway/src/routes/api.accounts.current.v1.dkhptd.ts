import { ObjectId } from "mongodb";
import express from "express";
import { cfg, CollectionName, JobStatus } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { ExceptionWrapper, JwtFilter } from "src/middlewares";
import { RateLimit } from "src/middlewares";
import { modify, m } from "src/modifiers";
import { BaseResponse } from "src/payloads";
import { isEmpty, isFalsy } from "src/utils";
import { encryptJobV1 } from "src/dto";
import { EmptyStringError, FaslyValueError, MissingRequestBodyDataError, RequireLengthFailed } from "src/exceptions";
import { DKHPTDJobV1 } from "src/entities";

export const router = express.Router();

router.post("/api/accounts/current/v1/dkhptd", JwtFilter(cfg.SECRET), RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), ExceptionWrapper(async (req, resp) => {
  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const ownerAccountId = new ObjectId(req.__accountId);
  const safeData = modify(data, [
    m.pick(["username", "password", "classIds", "timeToStart", "termId"]),
    m.normalizeString("username"),
    m.normalizeString("password"),
    m.normalizeArray("classIds", "string"),
    m.normalizeInt("timeToStart"),
    m.normalizeString("termId"),
    m.set("createdAt", Date.now()),
    m.set("status", JobStatus.READY),
    m.set("ownerAccountId", ownerAccountId),
  ]);

  const job = new DKHPTDJobV1(safeData);
  job.originTimeToStart = job.timeToStart;

  if (isFalsy(job.username)) throw new FaslyValueError("job.username", job.username);
  if (isEmpty(job.username)) throw new EmptyStringError("job.username", job.username);
  if (job.username.length < 8) throw new RequireLengthFailed("job.username", job.username);

  if (isFalsy(job.password)) throw new FaslyValueError("job.password", job.password);
  if (isEmpty(job.password)) throw new EmptyStringError("job.password", job.password);

  if (isFalsy(job.classIds)) throw new FaslyValueError("job.classIds");
  if (job.classIds.length == 0) throw new RequireLengthFailed("job.classIds");

  if (isFalsy(job.timeToStart)) throw new FaslyValueError("job.timeToStart");

  const eJob = new DKHPTDJobV1(encryptJobV1(job));
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .insertOne(eJob);
  resp.send(new BaseResponse().ok(job));
}));
