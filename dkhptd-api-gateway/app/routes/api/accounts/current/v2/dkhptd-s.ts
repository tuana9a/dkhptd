import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg, JobStatus } from "../../../../../cfg";
import { mongoConnectionPool } from "../../../../../connections";
import DKHPTDJobV2 from "../../../../../entities/DKHPTDJobV2";
import DKHPTDJobV2Logs from "../../../../../entities/DKHPTDJobV2Logs";
import ExceptionHandlerWrapper from "../../../../../middlewares/ExceptionHandlerWrapper";
import RateLimit from "../../../../../middlewares/RateLimit";
import { modify, PickProps, NormalizeStringProp, NormalizeArrayProp, NormalizeIntProp, SetProp } from "../../../../../modifiers";
import BaseResponse from "../../../../../payloads/BaseResponse";
import { resolveMongoFilter } from "../../../../../merin";
import { EmptyStringError, FaslyValueError, JobNotFoundError, NotAnArrayError, RequireLengthFailed } from "../../../../../exceptions";
import { isEmpty } from "lodash";
import { isFalsy } from "../../../../../utils";

const router = express.Router();

router.get("/:jobId/logs", ExceptionHandlerWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2Logs> = query.q ? resolveMongoFilter(query.q.split(",")) : {};

  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV2Logs.name)
    .find(filter)
    .toArray();
  const data = logs.map((x) => new DKHPTDJobV2Logs(x).toClient());
  resp.send(new BaseResponse().ok(data));
}));

router.get("/:jobId/d/logs", ExceptionHandlerWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2Logs> = query.q
    ? resolveMongoFilter(query.q.split(","))
    : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV2Logs.name)
    .find(filter)
    .toArray();
  const data = logs.map((x) => new DKHPTDJobV2Logs(x).decrypt().toClient());
  resp.send(new BaseResponse().ok(data));
}));

router.get("", ExceptionHandlerWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2> = query.q
    ? resolveMongoFilter(query.q.split(","))
    : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV2.name)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => new DKHPTDJobV2(x).toClient());
  resp.send(new BaseResponse().ok(data));
}));

router.post("", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body?.data;

  if (isFalsy(data)) throw new FaslyValueError("body.data");
  if (!Array.isArray(data)) throw new NotAnArrayError("body.data");

  const ownerAccountId = new ObjectId(req.__accountId);
  const result = [];
  const jobsToInsert = [];

  for (const entry of data) {
    try {
      const safeEntry = modify(entry, [
        PickProps(["username", "password", "classIds", "timeToStart"]),
        NormalizeStringProp("username"),
        NormalizeStringProp("password"),
        NormalizeArrayProp("classIds"),
        NormalizeIntProp("timeToStart"),
        SetProp("createdAt", Date.now()),
        SetProp("status", JobStatus.READY),
        SetProp("ownerAccountId", ownerAccountId),
      ]);

      const job = new DKHPTDJobV2(safeEntry);

      if (isFalsy(job.username)) throw new FaslyValueError("job.username", job.username);
      if (isEmpty(job.username)) throw new EmptyStringError("job.username", job.username);
      if (job.username.length < 8) throw new RequireLengthFailed("job.username", job.username);

      if (isFalsy(job.password)) throw new FaslyValueError("job.password", job.password);
      if (isEmpty(job.password)) throw new EmptyStringError("job.password", job.password);

      if (isFalsy(job.classIds)) throw new FaslyValueError("job.classIds");
      if (job.classIds.length == 0) throw new RequireLengthFailed("job.classIds");

      if (isFalsy(job.timeToStart)) throw new FaslyValueError("job.timeToStart");

      jobsToInsert.push(job);
      result.push(new BaseResponse().ok(job));
    } catch (err) {
      if (err.__isSafeError) {
        result.push(err.toBaseResponse());
      } else {
        result.push(new BaseResponse().failed(err).msg(err.message));
      }
    }
  }

  if (jobsToInsert.length !== 0) {
    const eJobsToInsert = jobsToInsert.map((x) => x.encrypt());
    await mongoConnectionPool
      .getClient()
      .db(cfg.DATABASE_NAME)
      .collection(DKHPTDJobV2.name)
      .insertMany(eJobsToInsert);
  }
  resp.send(new BaseResponse().ok(result));
}));

router.post("/:jobId/retry", ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV2> = {
    _id: new ObjectId(req.params.jobId),
    ownerAccountId: new ObjectId(accountId),
  };
  const existedJob = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV2.name)
    .findOne(filter);

  if (!existedJob) throw new JobNotFoundError(req.params.jobId);

  const newJob = new DKHPTDJobV2(existedJob).decrypt().toRetry();
  const eNewJob = newJob.encrypt();
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV2.name)
    .insertOne(eNewJob);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

export default router;
