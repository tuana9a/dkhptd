import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg, CollectionName, JobStatus } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { ExceptionWrapper, JwtFilter, RateLimit } from "src/middlewares";
import { decryptJobV2, encryptJobV2 } from "src/dto";
import { modify, m } from "src/modifiers";
import { BaseResponse } from "src/payloads";
import { resolveMongoFilter } from "src/merin";
import { DKHPTDJobV2 } from "src/entities";
import { isEmpty } from "lodash";
import { FaslyValueError, NotAnArrayError, EmptyStringError, RequireLengthFailed, JobNotFoundError, MissingRequestBodyDataError } from "src/exceptions";
import { isFalsy } from "src/utils";

const router = express.Router();

router.get("/api/accounts/current/v2/d/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV2)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => decryptJobV2(new DKHPTDJobV2(x)));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/api/accounts/current/v2/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2> = query.q
    ? resolveMongoFilter(query.q.split(","))
    : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV2)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => new DKHPTDJobV2(x));
  resp.send(new BaseResponse().ok(data));
}));

router.post("/api/accounts/current/v2/dkhptd-s", JwtFilter(cfg.SECRET), RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), ExceptionWrapper(async (req, resp) => {
  const data = req.body?.data;

  if (isFalsy(data)) throw new FaslyValueError("body.data");
  if (!Array.isArray(data)) throw new NotAnArrayError("body.data");

  const ownerAccountId = new ObjectId(req.__accountId);
  const result = [];
  const jobsToInsert = [];

  for (const entry of data) {
    try {
      const safeEntry = modify(entry, [
        m.pick(["username", "password", "classIds", "timeToStart"]),
        m.normalizeString("username"),
        m.normalizeString("password"),
        m.normalizeArray("classIds"),
        m.normalizeInt("timeToStart"),
        m.set("createdAt", Date.now()),
        m.set("status", JobStatus.READY),
        m.set("ownerAccountId", ownerAccountId),
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
        result.push(new BaseResponse().failed(err).m(err.message));
      }
    }
  }

  if (jobsToInsert.length !== 0) {
    const eJobsToInsert = jobsToInsert.map((x) => x.encrypt());
    await mongoConnectionPool
      .getClient()
      .db(cfg.DATABASE_NAME)
      .collection(CollectionName.DKHPTDV2)
      .insertMany(eJobsToInsert);
  }
  resp.send(new BaseResponse().ok(result));
}));

router.post("/api/accounts/current/v2/dkhptd-s/:jobId/retry", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV2> = {
    _id: new ObjectId(req.params.jobId),
    ownerAccountId: new ObjectId(accountId),
  };
  const existedJob = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV2)
    .findOne(filter);

  if (!existedJob) throw new JobNotFoundError(req.params.jobId);

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV2)
    .updateOne({ _id: new ObjectId(existedJob._id) }, { $set: { status: JobStatus.READY } });

  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.post("/api/accounts/current/v2/dkhptd", JwtFilter(cfg.SECRET), RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), ExceptionWrapper(async (req, resp) => {
  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const ownerAccountId = new ObjectId(req.__accountId);
  const safeData = modify(data, [
    m.pick(["username", "password", "classIds", "timeToStart"]),
    m.normalizeString("username"),
    m.normalizeString("password"),
    m.normalizeArray("classIds"),
    m.normalizeInt("timeToStart"),
    m.set("createdAt", Date.now()),
    m.set("status", JobStatus.READY),
    m.set("ownerAccountId", ownerAccountId),
  ]);

  const job = new DKHPTDJobV2(safeData);

  if (isFalsy(job.username)) throw new FaslyValueError("job.username", job.username);
  if (isEmpty(job.username)) throw new EmptyStringError("job.username", job.username);
  if (job.username.length < 8) throw new RequireLengthFailed("job.username", job.username);

  if (isFalsy(job.password)) throw new FaslyValueError("job.password", job.password);
  if (isEmpty(job.password)) throw new EmptyStringError("job.password", job.password);

  if (isFalsy(job.classIds)) throw new FaslyValueError("job.classIds");
  if (job.classIds.length == 0) throw new RequireLengthFailed("job.classIds");

  if (isFalsy(job.timeToStart)) throw new FaslyValueError("job.timeToStart");

  const eJob = new DKHPTDJobV2(encryptJobV2(job));
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV2)
    .insertOne(eJob);
  resp.send(new BaseResponse().ok(job));
}));

export default router;
