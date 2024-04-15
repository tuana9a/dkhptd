import { ObjectId } from "mongodb";
import express from "express";
import { isEmpty } from "lodash";
import { JobStatus, cfg, CollectionName } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { DKHPTDJobV1 } from "src/entities";
import { MissingRequestBodyDataError, FaslyValueError, EmptyStringError, RequireLengthFailed, InvalidTermIdError } from "src/exceptions";
import { ExceptionWrapper, InjectTermId, JwtFilter } from "src/middlewares";
import { RateLimit } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { modify, m } from "src/modifiers";
import { isFalsy, isValidTermId } from "src/utils";
import { encryptJobV1 } from "src/dto";

export const router = express.Router();

router.post("/api/accounts/current/term-ids/:termId/v1/dkhptd", JwtFilter(cfg.SECRET), InjectTermId(), RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), ExceptionWrapper(async (req, resp) => {
  const data = req.body;
  const termId = req.__termId;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();
  if (isFalsy(termId)) throw new FaslyValueError("termId");
  if (!isValidTermId(termId)) throw new InvalidTermIdError(termId);

  const ownerAccountId = new ObjectId(req.__accountId);
  const safeEntry = modify(data, [
    m.pick(["username", "password", "classIds", "timeToStart"]),
    m.normalizeString("username"),
    m.normalizeString("password"),
    m.normalizeArray("classIds", "string"),
    m.normalizeInt("timeToStart"),
    m.set("termId", termId),
    m.set("createdAt", Date.now()),
    m.set("status", JobStatus.READY),
    m.set("ownerAccountId", ownerAccountId),
  ]);

  const job = new DKHPTDJobV1(safeEntry);
  job.originTimeToStart = job.timeToStart;
  job.termId = termId;

  if (isFalsy(job.username)) throw new FaslyValueError("job.username", job.username);
  if (isEmpty(job.username)) throw new EmptyStringError("job.username", job.username);
  if (job.username.length < 8) throw new RequireLengthFailed("job.username", job.username);

  if (isFalsy(job.password)) throw new FaslyValueError("job.password", job.password);
  if (isEmpty(job.password)) throw new EmptyStringError("job.password", job.password);

  if (isFalsy(job.classIds)) throw new FaslyValueError("job.classIds");
  if (job.classIds.length == 0) throw new RequireLengthFailed("job.classIds");

  if (isFalsy(job.timeToStart)) throw new FaslyValueError("job.timeToStart");
  if (isFalsy(job.termId)) throw new FaslyValueError("job.termId");

  const eJob = new DKHPTDJobV1(encryptJobV1(job));
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .insertOne(eJob);
  resp.send(new BaseResponse().ok(job));
}));
