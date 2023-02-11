import { Filter, ObjectId } from "mongodb";
import express from "express";
import { isEmpty } from "lodash";
import { cfg, JobStatus } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { DKHPTDV1Result, DKHPTDResult, DKHPTDJobV1 } from "app/entities";
import { FaslyValueError, NotAnArrayError, EmptyStringError, RequireLengthFailed, JobNotFoundError } from "app/exceptions";
import { resolveMongoFilter } from "app/merin";
import { ExceptionWrapper } from "app/middlewares";
import { RateLimit } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";
import { modify, PickProps, NormalizeStringProp, NormalizeArrayProp, NormalizeIntProp, SetProp } from "app/modifiers";
import { decryptResultV1, isFalsy } from "app/utils";

const router = express.Router();

router.get("/:jobId/results", ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDV1Result> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);

  const logs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDV1Result.name)
    .find(filter)
    .toArray();
  const data = logs.map((x) => new DKHPTDV1Result(x));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/:jobId/d/results", ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDV1Result> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);

  const logs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDV1Result.name)
    .find(filter)
    .toArray();
  const data = logs.map((x) => new DKHPTDResult(decryptResultV1(new DKHPTDV1Result(x))));
  resp.send(new BaseResponse().ok(data));
}));

router.get("", ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.termId = termId;

  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => new DKHPTDJobV1(x));
  resp.send(new BaseResponse().ok(data));
}));

router.post("", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), ExceptionWrapper(async (req, resp) => {
  const data = req.body?.data;
  const termId = req.__termId;

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
        SetProp("termId", termId),
        NormalizeArrayProp("classIds", "string"),
        NormalizeIntProp("timeToStart"),
        SetProp("createdAt", Date.now()),
        SetProp("status", JobStatus.READY),
        SetProp("ownerAccountId", ownerAccountId),
      ]);

      const job = new DKHPTDJobV1(safeEntry);
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

      jobsToInsert.push(job);
      result.push(new BaseResponse().ok(job));
    } catch (err) {
      if (err.__isSafeError) {
        result.push(err.toBaseResponse());
      } else {
        result.push(new BaseResponse().failed(err).m(err.message));
      }
    }
  }

  if (jobsToInsert.length !== 0) {
    const eJobsToInsert = jobsToInsert.map((x) => x.encrypt());
    await mongoConnectionPool
      .getClient()
      .db(cfg.DATABASE_NAME)
      .collection(DKHPTDJobV1.name)
      .insertMany(eJobsToInsert);
  }
  resp.send(new BaseResponse().ok(result));
}));

router.post("/:jobId/retry", ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = {
    _id: new ObjectId(req.params.jobId),
    ownerAccountId: new ObjectId(accountId),
    termId: termId,
  };
  const existedJob = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .findOne(filter);

  if (!existedJob) throw new JobNotFoundError(req.params.jobId);

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .updateOne({ _id: new ObjectId(existedJob._id) }, { $set: { status: JobStatus.READY, timeToStart: Date.now() } });

  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.put("/:jobId/cancel", ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = {
    _id: new ObjectId(req.params.jobId),
    ownerAccountId: new ObjectId(accountId),
    termId: termId,
  };

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.delete("/:jobId", ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = {
    _id: new ObjectId(req.params.jobId),
    ownerAccountId: new ObjectId(accountId),
    termId: termId,
  };

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .deleteOne(filter);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

export default router;
