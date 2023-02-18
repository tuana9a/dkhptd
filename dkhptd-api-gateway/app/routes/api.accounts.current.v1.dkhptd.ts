import { ObjectId } from "mongodb";
import express from "express";
import { cfg, CollectionName, JobStatus } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { ExceptionWrapper, JwtFilter } from "app/middlewares";
import { RateLimit } from "app/middlewares";
import { modify, PickProps, NormalizeStringProp, NormalizeArrayProp, NormalizeIntProp, SetProp } from "app/modifiers";
import BaseResponse from "app/payloads/BaseResponse";
import { isEmpty, isFalsy } from "app/utils";
import { encryptJobV1 } from "app/dto";
import { EmptyStringError, FaslyValueError, MissingRequestBodyDataError, RequireLengthFailed } from "app/exceptions";
import { DKHPTDJobV1 } from "app/entities";

export const router = express.Router();

router.post("/api/accounts/current/v1/dkhptd", JwtFilter(cfg.SECRET), RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), ExceptionWrapper(async (req, resp) => {
  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const ownerAccountId = new ObjectId(req.__accountId);
  const safeData = modify(data, [
    PickProps(["username", "password", "classIds", "timeToStart", "termId"]),
    NormalizeStringProp("username"),
    NormalizeStringProp("password"),
    NormalizeArrayProp("classIds", "string"),
    NormalizeIntProp("timeToStart"),
    NormalizeIntProp("termId"),
    SetProp("createdAt", Date.now()),
    SetProp("status", JobStatus.READY),
    SetProp("ownerAccountId", ownerAccountId),
  ]);

  const job = new DKHPTDJobV1(safeData);

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
