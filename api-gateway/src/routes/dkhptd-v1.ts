import { Filter, ObjectId } from "mongodb";
import express from "express";
import { cfg, CollectionName, JobStatus } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { DKHPTDJobResult, DKHPTDJobV1, DKHPTDJobV1Result } from "src/entities";
import { resolveMongoFilter } from "src/merin";
import { ExceptionWrapper, InjectTermId, JwtFilter, RateLimit } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { modify, m } from "src/modifiers";
import { decryptJobV1, decryptJobV1Result, encryptJobV1 } from "src/dto";
import { isEmpty, isFalsy, isValidTermId } from "src/utils";
import { EmptyStringError, FaslyValueError, InvalidTermIdError, JobNotFoundError, MissingRequestBodyDataError, NotAnArrayError, OutOfTryError, RequireLengthFailed } from "src/exceptions";

const router = express.Router();

router.get("/api/accounts/current/term-ids/:termId/v1/d/dkhptd-s", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.termId = termId;

  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .find(filter)
    .toArray();

  const data = jobs.map((x) => decryptJobV1(new DKHPTDJobV1(x)));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/api/accounts/current/term-ids/:termId/v1/d/dkhptd-s/:jobId", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId) };
  filter.ownerAccountId = new ObjectId(accountId);
  filter.termId = termId;
  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .findOne(filter);
  const job = new DKHPTDJobV1(doc);
  resp.send(new BaseResponse().ok(decryptJobV1(job)));
}));

router.get("/api/accounts/current/term-ids/:termId/v1/dkhptd-s/:jobId/results", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1Result> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);

  const logs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1Result)
    .find(filter)
    .toArray();
  const data = logs.map((x) => new DKHPTDJobV1Result(x));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/api/accounts/current/term-ids/:termId/v1/dkhptd-s/:jobId/d/results", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1Result> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);

  const logs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1Result)
    .find(filter)
    .toArray();
  const data = logs.map((x) => new DKHPTDJobResult(decryptJobV1Result(new DKHPTDJobV1Result(x))));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/api/accounts/current/term-ids/:termId/v1/dkhptd-s", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.termId = termId;

  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => new DKHPTDJobV1(x));
  resp.send(new BaseResponse().ok(data));
}));

router.post("/api/accounts/current/term-ids/:termId/v1/dkhptd-s", JwtFilter(cfg.SECRET), InjectTermId(), RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), ExceptionWrapper(async (req, resp) => {
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
        m.pick(["username", "password", "classIds", "timeToStart"]),
        m.normalizeString("username"),
        m.normalizeString("password"),
        m.set("termId", termId),
        m.normalizeArray("classIds", "string"),
        m.normalizeInt("timeToStart"),
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
      .collection(CollectionName.DKHPTDV1)
      .insertMany(eJobsToInsert);
  }
  resp.send(new BaseResponse().ok(result));
}));

router.post("/api/accounts/current/term-ids/:termId/v1/dkhptd-s/:jobId/retry", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
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
    .collection(CollectionName.DKHPTDV1)
    .findOne(filter);

  if (!existedJob) throw new JobNotFoundError(req.params.jobId);

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .updateOne({ _id: new ObjectId(existedJob._id) }, { $set: { status: JobStatus.READY, timeToStart: Date.now() } });

  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.put("/api/accounts/current/term-ids/:termId/v1/dkhptd-s/:jobId/cancel", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
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
    .collection(CollectionName.DKHPTDV1)
    .findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.delete("/api/accounts/current/term-ids/:termId/v1/dkhptd-s/:jobId", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
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
    .collection(CollectionName.DKHPTDV1)
    .deleteOne(filter);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

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

router.get("/api/accounts/current/v1/d/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);

  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => decryptJobV1(new DKHPTDJobV1(x)));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/api/accounts/current/v1/d/dkhptd-s/:jobId", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId) };
  filter.ownerAccountId = new ObjectId(accountId);
  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .findOne(filter);
  const job = new DKHPTDJobV1(doc);
  resp.send(new BaseResponse().ok(decryptJobV1(job)));
}));

router.get("/api/accounts/current/v1/dkhptd-s/:jobId/results", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1Result> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);

  const logs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1Result)
    .find(filter)
    .toArray();
  const data = logs.map((x) => new DKHPTDJobV1Result(x));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/api/accounts/current/v1/dkhptd-s/:jobId/d/results", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1Result> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);

  const logs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1Result)
    .find(filter)
    .toArray();
  const data = logs.map((x) => new DKHPTDJobResult(decryptJobV1Result(new DKHPTDJobV1Result(x))));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/api/accounts/current/v1/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);

  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => new DKHPTDJobV1(x));
  resp.send(new BaseResponse().ok(data));
}));

router.post("/api/accounts/current/v1/dkhptd-s", JwtFilter(cfg.SECRET), RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), ExceptionWrapper(async (req, resp) => {
  const data = req.body?.data;

  if (isFalsy(data)) throw new FaslyValueError("body.data");
  if (!Array.isArray(data)) throw new NotAnArrayError("body.data");

  const ownerAccountId = new ObjectId(req.__accountId);
  const result = [];
  const jobsToInsert = [];

  for (const entry of data) {
    try {
      const safeEntry = modify(entry, [
        m.pick(["username", "password", "classIds", "timeToStart", "termId"]),
        m.normalizeString("username"),
        m.normalizeString("password"),
        m.normalizeArray("classIds", "string"),
        m.normalizeInt("timeToStart"),
        m.normalizeInt("termId"),
        m.set("createdAt", Date.now()),
        m.set("status", JobStatus.READY),
        m.set("ownerAccountId", ownerAccountId),
      ]);

      const job = new DKHPTDJobV1(safeEntry);
      job.originTimeToStart = job.timeToStart;

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
      .collection(CollectionName.DKHPTDV1)
      .insertMany(eJobsToInsert);
  }
  resp.send(new BaseResponse().ok(result));
}));

router.post("/api/accounts/current/v1/dkhptd-s/:jobId/retry", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV1> = {
    _id: new ObjectId(req.params.jobId),
    ownerAccountId: new ObjectId(accountId),
  };
  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .findOne(filter);

  if (!doc) throw new JobNotFoundError(req.params.jobId);
  const existedJob = new DKHPTDJobV1(doc);
  if (existedJob.no > 10) throw new OutOfTryError(existedJob._id);

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .updateOne({ _id: new ObjectId(existedJob._id) }, { $set: { status: JobStatus.READY } });

  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.put("/api/accounts/current/v1/dkhptd-s/:jobId/cancel", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV1> = {
    _id: new ObjectId(req.params.jobId),
    ownerAccountId: new ObjectId(accountId),
  };
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.delete("/api/accounts/current/v1/dkhptd-s/:jobId", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV1> = {
    _id: new ObjectId(req.params.jobId),
    ownerAccountId: new ObjectId(accountId),
  };
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .deleteOne(filter);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

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

export default router;
