import express from "express";
import { Filter, ObjectId } from "mongodb";
import cfg from "../cfg";
import JobStatus from "../configs/JobStatus";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import DKHPTDJobV1 from "../entities/DKHPTDJobV1";
import JobNotFoundError from "../exceptions/JobNotFoundError";
import MissingRequestBodyDataError from "../exceptions/MissingRequestBodyDataError";
import JwtFilter from "../middlewares/JwtFilter";
import RateLimit from "../middlewares/RateLimit";
import NormalizeArrayProp from "../modifiers/NormalizeArrayProp";
import NormalizeIntProp from "../modifiers/NormalizeIntProp";
import NormalizeStringProp from "../modifiers/NormalizeStringProp";
import ObjectModifer from "../modifiers/ObjectModifier";
import PickProps from "../modifiers/PickProps";
import SetProp from "../modifiers/SetProp";
import BaseResponse from "../payloads/BaseResponse";
import notEmptyString from "../requires/notEmptyString";
import requireArray from "../requires/requireArray";
import requireLength from "../requires/requireLength";
import requireNotFalsy from "../requires/requireNotFalsy";
import requireTypeOf from "../requires/requireTypeOf";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";
import resolveMongoFilter from "../utils/resolveMongoFilter";
import isFalsy from "../validations/isFalsy";

const router = express.Router();

router.get("/api/accounts/current/v1/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJobV1(x).toClient())));
}));

router.get("/api/accounts/current/v1/d/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJobV1(x).decrypt().toClient())));
}));

router.get("/api/accounts/current/v1/d/dkhptd-s/:jobId", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId) };
  filter.ownerAccountId = new ObjectId(accountId);
  const doc = await mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).findOne(filter);
  const job = new DKHPTDJobV1(doc);
  resp.send(new BaseResponse().ok(job.decrypt().toClient()));
}));

router.post("/api/accounts/current/v1/dkhptd", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const ownerAccountId = new ObjectId(req.__accountId);
  const safeData = new ObjectModifer(data)
    .modify(PickProps(["username", "password", "classIds", "timeToStart"]))
    .modify(NormalizeStringProp("username"))
    .modify(NormalizeStringProp("password"))
    .modify(NormalizeArrayProp("classIds", "string"))
    .modify(NormalizeIntProp("timeToStart"))
    .modify(SetProp("createdAt", Date.now()))
    .modify(SetProp("status", JobStatus.READY))
    .modify(SetProp("ownerAccountId", ownerAccountId))
    .collect();

  const job = new DKHPTDJobV1(safeData);

  requireNotFalsy("job.username", job.username);
  notEmptyString("job.username", job.username);
  requireLength("job.username", job.username, x => x >= 8);

  requireNotFalsy("job.password", job.password);
  notEmptyString("job.password", job.password);

  requireNotFalsy("job.classIds", job.classIds);
  requireLength("job.classIds", job.classIds, x => x > 0);
  requireArray("job.classIds", job.classIds, [requireTypeOf("string")]);

  requireNotFalsy("job.timeToStart", job.timeToStart);

  const eJob = job.encrypt();
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).insertOne(eJob);
  resp.send(new BaseResponse().ok(job));
}));

router.post("/api/accounts/current/v1/dkhptd-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body?.data;

  requireNotFalsy("body.data", data);
  requireArray("body.data", data);

  const ownerAccountId = new ObjectId(req.__accountId);
  const result = [];
  const jobsToInsert = [];

  for (const entry of data) {
    try {
      const safeEntry = new ObjectModifer(entry)
        .modify(PickProps(["username", "password", "classIds", "timeToStart"]))
        .modify(NormalizeStringProp("username"))
        .modify(NormalizeStringProp("password"))
        .modify(NormalizeArrayProp("classIds", "string"))
        .modify(NormalizeIntProp("timeToStart"))
        .modify(SetProp("createdAt", Date.now()))
        .modify(SetProp("status", JobStatus.READY))
        .modify(SetProp("ownerAccountId", ownerAccountId))
        .collect();

      const job = new DKHPTDJobV1(safeEntry);

      requireNotFalsy("job.username", job.username);
      notEmptyString("job.username", job.username);
      requireLength("job.username", job.username, x => x >= 8);

      requireNotFalsy("job.password", job.password);
      notEmptyString("job.password", job.password);

      requireNotFalsy("job.classIds", job.classIds);
      requireLength("job.classIds", job.classIds, x => x > 0);
      requireArray("job.classIds", job.classIds, [requireTypeOf("string")]);

      requireNotFalsy("job.timeToStart", job.timeToStart);

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
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).insertMany(eJobsToInsert);
  }
  resp.send(new BaseResponse().ok(result));
}));

router.post("/api/accounts/current/v1/dkhptd-s/:jobId/retry", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  const existedJob = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).findOne(filter);

  if (!existedJob) throw new JobNotFoundError(req.params.jobId);

  const newJob = new DKHPTDJobV1(existedJob).decrypt().toRetry();
  const eNewJob = newJob.encrypt();
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .insertOne(eNewJob);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.put("/api/accounts/current/v1/dkhptd-s/:jobId/cancel", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.delete("/api/accounts/current/v1/dkhptd-s/:jobId", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .deleteOne(filter);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

export default router;
