import { ObjectId } from "mongodb";
import express from "express";
import { cfg, JobStatus } from "../../../../../cfg";
import { mongoConnectionPool } from "../../../../../connections";
import DKHPTDJobV1 from "../../../../../entities/DKHPTDJobV1";
import ExceptionHandlerWrapper from "../../../../../middlewares/ExceptionHandlerWrapper";
import RateLimit from "../../../../../middlewares/RateLimit";
import { modify, PickProps, NormalizeStringProp, NormalizeArrayProp, NormalizeIntProp, SetProp } from "../../../../../modifiers";
import BaseResponse from "../../../../../payloads/BaseResponse";
import { isEmpty, isFalsy } from "../../../../../utils";
import { EmptyStringError, FaslyValueError, MissingRequestBodyDataError, RequireLengthFailed } from "../../../../../exceptions";

const router = express.Router();

router.post("/dkhptd", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const ownerAccountId = new ObjectId(req.__accountId);
  const safeData = modify(data, [
    PickProps(["username", "password", "classIds", "timeToStart"]),
    NormalizeStringProp("username"),
    NormalizeStringProp("password"),
    NormalizeArrayProp("classIds", "string"),
    NormalizeIntProp("timeToStart"),
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

  const eJob = job.encrypt();
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .insertOne(eJob);
  resp.send(new BaseResponse().ok(job));
}));


export default router;