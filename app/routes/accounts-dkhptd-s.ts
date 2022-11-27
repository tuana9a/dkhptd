import express from "express";
import { Filter, ObjectId } from "mongodb";
import cfg from "../cfg";
import JobStatus from "../configs/JobStatus";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import DKHPTDJob from "../entities/DKHPTDJob";
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
import getRequestAccountId from "../utils/getRequestAccountId";
import resolveMongoFilter from "../utils/resolveMongoFilter";
import isFalsy from "../validations/isFalsy";

const router = express.Router();

router.get("/api/accounts/current/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = getRequestAccountId(req);
  const filter: Filter<DKHPTDJob> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJob.name)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJob(x).toClient())));
}));

router.post("/api/accounts/current/dkhptd", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const ownerAccountId = new ObjectId(getRequestAccountId(req));
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

  const job = new DKHPTDJob(safeData);

  requireNotFalsy("job.username", job.username);
  notEmptyString("job.username", job.username);
  requireLength("job.username", job.username, x => x >= 8);

  requireNotFalsy("job.password", job.password,);
  notEmptyString("job.password", job.password);

  requireNotFalsy("job.classIds", job.classIds);
  requireLength("job.classIds", job.classIds, x => x > 0);
  requireArray("job.classIds", job.classIds, [requireTypeOf("string")]);

  requireNotFalsy("job.timeToStart", job.timeToStart);

  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJob.name)
    .insertOne(job);
  resp.send(new BaseResponse().ok(job));
}));

router.post("/api/accounts/current/dkhptd-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body?.data;

  requireNotFalsy("body.data", data);
  requireArray("body.data", data);

  const ownerAccountId = new ObjectId(getRequestAccountId(req));
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

      const job = new DKHPTDJob(safeEntry);

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
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(DKHPTDJob.name)
      .insertMany(jobsToInsert);
  }
  resp.send(new BaseResponse().ok(result));
}));

router.delete("/api/accounts/current/dkhptd-s/:jobId", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = getRequestAccountId(req);
  const filter: Filter<DKHPTDJob> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJob.name)
    .deleteOne(filter);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.post("/api/accounts/current/dkhptd-s/:jobId/retry", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = getRequestAccountId(req);
  const filter: Filter<DKHPTDJob> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  const existedJob = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).findOne(filter);

  if (isFalsy(existedJob)) throw new JobNotFoundError(req.params.jobId);

  const newJob = new DKHPTDJob(existedJob).toRetry();
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).insertOne(newJob);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.put("/api/accounts/current/dkhptd-s/:jobId/cancel", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = getRequestAccountId(req);
  const filter: Filter<DKHPTDJob> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

export default router;
