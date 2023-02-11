import { ObjectId } from "mongodb";
import express from "express";
import { isEmpty } from "lodash";
import { JobStatus, cfg } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { DKHPTDJobV1 } from "app/entities";
import { MissingRequestBodyDataError, FaslyValueError, EmptyStringError, RequireLengthFailed, InvalidTermIdError } from "app/exceptions";
import { ExceptionWrapper } from "app/middlewares";
import { RateLimit } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";
import { modify, PickProps, NormalizeStringProp, NormalizeArrayProp, NormalizeIntProp, SetProp } from "app/modifiers";
import { isFalsy, isValidTermId, encryptJobV1 } from "app/utils";

const router = express.Router();

router.post("/dkhptd", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), ExceptionWrapper(async (req, resp) => {
  const data = req.body;
  const termId = req.__termId;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();
  if (isFalsy(termId)) throw new FaslyValueError("termId");
  if (!isValidTermId(termId)) throw new InvalidTermIdError(termId);

  const ownerAccountId = new ObjectId(req.__accountId);
  const safeData = modify(data, [
    PickProps(["username", "password", "classIds", "timeToStart"]),
    NormalizeStringProp("username"),
    NormalizeStringProp("password"),
    NormalizeArrayProp("classIds", "string"),
    NormalizeIntProp("timeToStart"),
    SetProp("termId", termId),
    SetProp("createdAt", Date.now()),
    SetProp("status", JobStatus.READY),
    SetProp("ownerAccountId", ownerAccountId),
  ]);

  const job = new DKHPTDJobV1(safeData);
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
    .collection(DKHPTDJobV1.name)
    .insertOne(eJob);
  resp.send(new BaseResponse().ok(job));
}));


export default router;