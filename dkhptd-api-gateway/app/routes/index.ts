import express from "express";
import { Filter, ObjectId } from "mongodb";
import multer from "multer";
import jwt from "jsonwebtoken";

import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import JobStatus from "../configs/JobStatus";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import Account from "../entities/Account";
import AccountPreference from "../entities/AccountPreference";
import ClassToRegister from "../entities/ClassToRegister";
import DKHPTDJob from "../entities/DKHPTDJob";
import DKHPTDJobLogs from "../entities/DKHPTDJobLogs";
import DKHPTDJobV1 from "../entities/DKHPTDJobV1";
import DKHPTDJobV1Logs from "../entities/DKHPTDJobV1Logs";
import DKHPTDJobV2 from "../entities/DKHPTDJobV2";
import DKHPTDJobV2Logs from "../entities/DKHPTDJobV2Logs";
import JobNotFoundError from "../exceptions/JobNotFoundError";
import MissingRequestBodyDataError from "../exceptions/MissingRequestBodyDataError";
import UsernameExistedError from "../exceptions/UsernameExistedError";
import UsernameNotFoundError from "../exceptions/UsernameNotFoundError";
import WrongPasswordError from "../exceptions/WrongPasswordError";
import bus from "../bus";
import JwtFilter from "../middlewares/JwtFilter";
import RateLimit from "../middlewares/RateLimit";
import SecretFilter from "../middlewares/SecretFilter";
import NormalizeArrayProp from "../modifiers/NormalizeArrayProp";
import NormalizeIntProp from "../modifiers/NormalizeIntProp";
import NormalizeStringProp from "../modifiers/NormalizeStringProp";
import ObjectModifer from "../modifiers/ObjectModifier";
import PickProps from "../modifiers/PickProps";
import ReplaceCurrentPropValueWith from "../modifiers/ReplaceCurrentPropValueWith";
import SetProp from "../modifiers/SetProp";
import BaseResponse from "../payloads/BaseResponse";
import LoginResponse from "../payloads/LoginResponse";
import LoginWithUsernamePasswordRequest from "../payloads/LoginWithUsernamePasswordRequest";
import notEmptyString from "../validations/notEmptyString";
import mustBeArray from "../validations/mustBeArray";
import lengthMustGreaterThan from "../validations/lengthMustGreaterThan";
import mustNotFalsy from "../validations/mustNotFalsy";
import mustBeTypeOf from "../validations/mustBeTypeOf";
import mustValidTermId from "../validations/mustValidTermId";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";
import resolveMongoFilter from "../utils/resolveMongoFilter";
import toNormalizedString from "../utils/toNormalizedString";
import toSafeInt from "../utils/toSafeInt";
import toSHA256 from "../utils/toSHA256";
import isFalsy from "../validations/isFalsy";

const router = express.Router();

router.post("/api/login", ExceptionHandlerWrapper(async (req, resp) => {
  const body = new LoginWithUsernamePasswordRequest(new ObjectModifer(req.body)
    .modify(PickProps(["username", "password"]))
    .modify(NormalizeStringProp("username"))
    .modify(NormalizeStringProp("password"))
    .collect());

  const hashedPassword = toSHA256(body.password);

  const doc = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne({ username: body.username });

  if (!doc) throw new UsernameNotFoundError();

  const account = new Account(doc);

  if (account.password != hashedPassword) {
    throw new WrongPasswordError();
  }

  const token = jwt.sign({ id: account._id }, cfg.SECRET, { expiresIn: "1d" });
  resp.send(new BaseResponse().ok(new LoginResponse(token)));
}));

router.post("/api/signup", ExceptionHandlerWrapper(async (req, resp) => {
  const body = new LoginWithUsernamePasswordRequest(new ObjectModifer(req.body)
    .modify(PickProps(["username", "password"]))
    .modify(NormalizeStringProp("username"))
    .modify(NormalizeStringProp("password"))
    .modify(ReplaceCurrentPropValueWith("password", (oldValue) => toSHA256(oldValue)))
    .collect());

  const isUsernameExists = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne({ username: body.username });

  if (isUsernameExists) {
    throw new UsernameExistedError(body.username);
  }

  const account = new Account(body);

  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .insertOne(account);

  resp.send(new BaseResponse().ok(account.toClient()));
}));

router.get("/api/accounts/current/dkhptd-s/:jobId/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobLogs> = {
    ownerAccountId: new ObjectId(accountId),
    jobId: new ObjectId(req.params.jobId),
  };
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobLogs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobLogs(x).toClient())));
}));

router.get("/api/accounts/current/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;
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

  const job = new DKHPTDJob(safeData);

  mustNotFalsy("job.username", job.username);
  notEmptyString("job.username", job.username);
  lengthMustGreaterThan("job.username", job.username, 8);

  mustNotFalsy("job.password", job.password,);
  notEmptyString("job.password", job.password);

  mustNotFalsy("job.classIds", job.classIds);
  lengthMustGreaterThan("job.classIds", job.classIds, 0);
  mustBeArray("job.classIds", job.classIds, [mustBeTypeOf("string")]);

  mustNotFalsy("job.timeToStart", job.timeToStart);

  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJob.name)
    .insertOne(job);
  resp.send(new BaseResponse().ok(job));
}));

router.post("/api/accounts/current/dkhptd-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body?.data;

  mustNotFalsy("body.data", data);
  mustBeArray("body.data", data);

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

      const job = new DKHPTDJob(safeEntry);

      mustNotFalsy("job.username", job.username);
      notEmptyString("job.username", job.username);
      lengthMustGreaterThan("job.username", job.username, 8);

      mustNotFalsy("job.password", job.password);
      notEmptyString("job.password", job.password);

      mustNotFalsy("job.classIds", job.classIds);
      lengthMustGreaterThan("job.classIds", job.classIds, 0);
      mustBeArray("job.classIds", job.classIds, [mustBeTypeOf("string")]);

      mustNotFalsy("job.timeToStart", job.timeToStart);

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
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJob> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJob.name)
    .deleteOne(filter);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.post("/api/accounts/current/dkhptd-s/:jobId/retry", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
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
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJob> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.get("/api/accounts/current/preferences", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<AccountPreference> = { ownerAccountId: new ObjectId(accountId) };
  const preferences = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(preferences));
}));

router.put("/api/accounts/current/preferences/:preferenceId", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const preferenceId = new ObjectId(req.params.preferenceId);

  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = new ObjectModifer(data)
    .modify(PickProps(["termId", "wantedSubjectIds"]))
    .modify(NormalizeStringProp("termId"))
    .modify(NormalizeArrayProp("wantedSubjectIds", "string"))
    .collect();
  const filter: Filter<AccountPreference> = { _id: preferenceId, ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .updateOne(filter, {
      $set: {
        termId: body.termId,
        wantedSubjectIds: body.wantedSubjectIds
      }
    });
  resp.send(new BaseResponse().ok());
}));

router.post("/api/accounts/current/preference", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = new ObjectModifer(data)
    .modify(PickProps(["termId", "wantedSubjectIds"]))
    .modify(NormalizeStringProp("termId"))
    .modify(NormalizeArrayProp("wantedSubjectIds", "string"))
    .modify(SetProp("ownerAccountId", new ObjectId(accountId)))
    .collect();
  const newPreference = new AccountPreference(body);
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .insertOne(newPreference);
  resp.send(new BaseResponse().ok());
}));

router.get("/api/accounts/current/v1/dkhptd-s/:jobId/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1Logs> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1Logs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV1Logs(x).toClient())));
}));

router.get("/api/accounts/current/v1/dkhptd-s/:jobId/d/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1Logs> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1Logs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV1Logs(x).decrypt().toClient())));
}));

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

  mustNotFalsy("job.username", job.username);
  notEmptyString("job.username", job.username);
  lengthMustGreaterThan("job.username", job.username, 8);

  mustNotFalsy("job.password", job.password);
  notEmptyString("job.password", job.password);

  mustNotFalsy("job.classIds", job.classIds);
  lengthMustGreaterThan("job.classIds", job.classIds, 0);
  mustBeArray("job.classIds", job.classIds, [mustBeTypeOf("string")]);

  mustNotFalsy("job.timeToStart", job.timeToStart);

  const eJob = job.encrypt();
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).insertOne(eJob);
  resp.send(new BaseResponse().ok(job));
}));

router.post("/api/accounts/current/v1/dkhptd-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body?.data;

  mustNotFalsy("body.data", data);
  mustBeArray("body.data", data);

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

      mustNotFalsy("job.username", job.username);
      notEmptyString("job.username", job.username);
      lengthMustGreaterThan("job.username", job.username, 8);

      mustNotFalsy("job.password", job.password);
      notEmptyString("job.password", job.password);

      mustNotFalsy("job.classIds", job.classIds);
      lengthMustGreaterThan("job.classIds", job.classIds, 0);
      mustBeArray("job.classIds", job.classIds, [mustBeTypeOf("string")]);

      mustNotFalsy("job.timeToStart", job.timeToStart);

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

router.get("/api/accounts/current/v2/dkhptd-s/:jobId/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2Logs> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2Logs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV2Logs(x).toClient())));
}));

router.get("/api/accounts/current/v2/dkhptd-s/:jobId/d/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2Logs> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2Logs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV2Logs(x).decrypt().toClient())));
}));

router.get("/api/accounts/current/v2/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJobV2(x).toClient())));
}));

router.get("/api/accounts/current/v2/d/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJobV2(x).decrypt().toClient())));
}));

router.post("/api/accounts/current/v2/dkhptd", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const ownerAccountId = new ObjectId(req.__accountId);
  const safeData = new ObjectModifer(data)
    .modify(PickProps(["username", "password", "classIds", "timeToStart"]))
    .modify(NormalizeStringProp("username"))
    .modify(NormalizeStringProp("password"))
    .modify(NormalizeArrayProp("classIds"))
    .modify(NormalizeIntProp("timeToStart"))
    .modify(SetProp("createdAt", Date.now()))
    .modify(SetProp("status", JobStatus.READY))
    .modify(SetProp("ownerAccountId", ownerAccountId))
    .collect();

  const job = new DKHPTDJobV2(safeData);

  mustNotFalsy("job.username", job.username);
  notEmptyString("job.username", job.username);
  lengthMustGreaterThan("job.username", job.username, 8);

  mustNotFalsy("job.password", job.password);
  notEmptyString("job.password", job.password);

  mustNotFalsy("job.classIds", job.classIds);
  lengthMustGreaterThan("job.classIds", job.classIds, 0);
  mustBeArray("job.classIds", job.classIds, [e => mustBeArray(e, [mustBeTypeOf("string")])]);

  mustNotFalsy("job.timeToStart", job.timeToStart);

  const eJob = job.encrypt();
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).insertOne(eJob);
  resp.send(new BaseResponse().ok(job));
}));

router.post("/api/accounts/current/v2/dkhptd-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body?.data;

  mustNotFalsy("body.data", data);
  mustBeArray("body.data", data);

  const ownerAccountId = new ObjectId(req.__accountId);
  const result = [];
  const jobsToInsert = [];

  for (const entry of data) {
    try {
      const safeEntry = new ObjectModifer(entry)
        .modify(PickProps(["username", "password", "classIds", "timeToStart"]))
        .modify(NormalizeStringProp("username"))
        .modify(NormalizeStringProp("password"))
        .modify(NormalizeArrayProp("classIds"))
        .modify(NormalizeIntProp("timeToStart"))
        .modify(SetProp("createdAt", Date.now()))
        .modify(SetProp("status", JobStatus.READY))
        .modify(SetProp("ownerAccountId", ownerAccountId))
        .collect();

      const job = new DKHPTDJobV2(safeEntry);

      mustNotFalsy("job.username", job.username);
      notEmptyString("job.username", job.username);
      lengthMustGreaterThan("job.username", job.username, 8);

      mustNotFalsy("job.password", job.password);
      notEmptyString("job.password", job.password);

      mustNotFalsy("job.classIds", job.classIds);
      lengthMustGreaterThan("job.classIds", job.classIds, 0);
      mustBeArray("job.classIds", job.classIds, [e => mustBeArray(e, [mustBeTypeOf("string")])]);

      mustNotFalsy("job.timeToStart", job.timeToStart);

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
      .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).insertMany(eJobsToInsert);
  }
  resp.send(new BaseResponse().ok(result));
}));

router.post("/api/accounts/current/v2/dkhptd-s/:jobId/retry", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV2> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  const existedJob = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).findOne(filter);

  if (!existedJob) throw new JobNotFoundError(req.params.jobId);

  const newJob = new DKHPTDJobV2(existedJob).decrypt().toRetry();
  const eNewJob = newJob.encrypt();
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).insertOne(eNewJob);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.put("/api/accounts/current/v1/dkhptd-s/:jobId/cancel", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV2> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.delete("/api/accounts/current/v1/dkhptd-s/:jobId", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<DKHPTDJobV2> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).deleteOne(filter);
  resp.send(new BaseResponse().ok(req.params.jobId));
}));

router.get("/api/accounts/current", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<Account> = { _id: new ObjectId(accountId) };
  const account = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne(filter);

  if (isFalsy(account)) throw new UsernameNotFoundError(accountId);

  resp.send(new BaseResponse().ok(new Account(account).toClient()));
}));

router.put("/api/accounts/current/password", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const body = new ObjectModifer(req.body)
    .modify(PickProps(["password"]))
    .modify(NormalizeStringProp("password"))
    .modify(ReplaceCurrentPropValueWith("password", (oldValue) => toSHA256(oldValue)))
    .collect();

  const newHashedPassword = body.password;

  const filter: Filter<Account> = { _id: new ObjectId(accountId) };

  const account = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne(filter);

  if (isFalsy(account)) throw new UsernameNotFoundError(accountId);

  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .updateOne(filter, { $set: { password: newHashedPassword } });

  resp.send(new BaseResponse().ok(new Account(account).toClient()));
}));

router.post("/api/class-to-registers", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body?.data;

  mustNotFalsy("body.data", data);
  mustBeArray("body.data", data);

  const classToRegistersToInsert = [];
  const result = [];
  for (const entry of data) {
    try {
      const classToRegisterConstruct = new ObjectModifer(entry)
        .modify(PickProps([
          "classId",
          "secondClassId",
          "subjectId",
          "subjectName",
          "classType",
          "learnDayNumber",
          "learnAtDayOfWeek",
          "learnTime",
          "learnRoom",
          "learnWeek",
          "describe",
          "termId",
        ]))
        .modify(NormalizeIntProp("classId"))
        .modify(NormalizeIntProp("secondClassId"))
        .modify(NormalizeStringProp("subjectId"))
        .modify(NormalizeStringProp("subjectName"))
        .modify(NormalizeStringProp("classType"))
        .modify(NormalizeIntProp("learnDayNumber"))
        .modify(NormalizeIntProp("learnAtDayOfWeek"))
        .modify(NormalizeStringProp("learnTime"))
        .modify(NormalizeStringProp("learnRoom"))
        .modify(NormalizeStringProp("learnWeek"))
        .modify(NormalizeStringProp("describe"))
        .modify(NormalizeStringProp("termId"))
        .modify(SetProp("createdAt", Date.now()))
        .collect();

      const classToRegister = new ClassToRegister(classToRegisterConstruct);

      mustValidTermId("classToRegister.termId", classToRegister.termId);

      classToRegistersToInsert.push(classToRegister);
      result.push(new BaseResponse().ok(classToRegister));
    } catch (err) {
      if (err.__isSafeError) {
        result.push(err.toBaseResponse());
      } else {
        result.push(new BaseResponse().failed(err).msg(err.message));
      }
    }
  }

  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).insertMany(classToRegistersToInsert);
  resp.send(new BaseResponse().ok(result));
}));

router.post("/api/class-to-register-file", SecretFilter(cfg.SECRET), multer({ limits: { fileSize: 5 * 1000 * 1000 /* 5mb */ } }).single("file"), ExceptionHandlerWrapper(async (req, resp) => {
  const file = req.file;
  bus.emit(AppEvent.TKB_XLSX_UPLOADED, file.buffer);
  resp.send(new BaseResponse().ok());
}));

router.delete("/api/class-to-registers", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const filter: Filter<ClassToRegister> = resolveMongoFilter(String(query.q).split(","));
  const deleteResult = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .deleteMany(filter);
  resp.send(new BaseResponse().ok(deleteResult.deletedCount));
}));

router.get("/api/class-to-registers", ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query)
    .modify(PickProps(["q", "page", "size"], { dropFalsy: true }))
    .modify(NormalizeIntProp("page"))
    .modify(NormalizeIntProp("size"))
    .collect();
  const page = query.page || 0;
  const size = query.size || 10;

  const filter: Filter<ClassToRegister> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  const classToRegisters = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).find(filter).skip(page * size).limit(size).toArray();
  resp.send(new BaseResponse().ok(classToRegisters.map((x) => new ClassToRegister(x))));
}));

router.get("/api/class-to-registers/class-ids", ExceptionHandlerWrapper(async (req, resp) => {
  const classIds = toNormalizedString(req.query.classIds).split(",").map((x) => toNormalizedString(x));
  const termId = toNormalizedString(req.query.termId);

  mustValidTermId("termId", termId);

  const filter = { classId: { $in: classIds }, termId: termId };
  const classToRegisters = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/api/class-to-registers/class-ids/start-withs", ExceptionHandlerWrapper(async (req, resp) => {
  const classIds = toNormalizedString(req.query.classIds).split(",").map((x) => toNormalizedString(x));
  const termId = toNormalizedString(req.query.termId);

  mustValidTermId("termId", termId);

  const filter = {
    classId: {
      $or: classIds.map(x => toSafeInt(x)).map((classId) => {
        const missing = 6 - String(classId).length;
        if (missing === 0) {
          return { classId: classId };
        }
        const delta = 10 ** missing;
        return { classId: { $gte: classId * delta, $lte: classId * delta + delta } };
      }),
    },
    termId: termId,
  };
  const classToRegisters = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/api/class-to-registers/class-ids/:classId", ExceptionHandlerWrapper(async (req, resp) => {
  const classId = toNormalizedString(req.params.classId);
  const termId = toNormalizedString(req.query.termId);

  mustValidTermId("termId", termId);

  const filter = { classId: classId, termId: termId };
  const classToRegister = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

router.get("/api/term-ids/:termId/class-to-registers", ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const termId = toSafeInt(req.params.termId);

  mustValidTermId("termId", termId);

  const filter: Filter<ClassToRegister> = resolveMongoFilter(String(query.q).split(","));
  filter.termId = termId;
  const classToRegisters = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/api/term-ids/:termId/class-to-registers/:id", ExceptionHandlerWrapper(async (req, resp) => {
  const id = toNormalizedString(req.params.id);
  const termId = toSafeInt(req.params.termId);
  const filter: Filter<ClassToRegister> = { _id: new ObjectId(id) };
  filter.termId = termId;
  const classToRegister = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

router.delete("/api/term-ids/:termId/class-to-registers/class-ids/:classId/duplicates", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const classId = toSafeInt(req.params.classId);
  const termId = toSafeInt(req.params.termId);

  const filter: Filter<ClassToRegister> = { classId: classId, termId: termId };
  const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(ClassToRegister.name).find(filter);
  const deleteIds = new Set<ObjectId>();
  const newestClassToRegisters = new Map<string, ClassToRegister>();
  const delimiter = "-";

  while (await cursor.hasNext()) {
    const classToRegister = new ClassToRegister(await cursor.next());
    const { classId, learnDayNumber, termId } = classToRegister;
    const key = [termId, classId, learnDayNumber].join(delimiter);
    const existed = newestClassToRegisters.get(key);
    if (existed) {
      if (existed.createdAt >= classToRegister.createdAt) {
        deleteIds.add(classToRegister._id);
      } else {
        newestClassToRegisters.set(key, classToRegister);
        deleteIds.add(existed._id);
      }
    } else {
      newestClassToRegisters.set(key, classToRegister);
    }
  }

  const deleteFilter: Filter<ClassToRegister> = { _id: { $in: Array.from(deleteIds) } };
  const deleteResult = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .deleteMany(deleteFilter);

  resp.send(new BaseResponse().ok(deleteResult.deletedCount));
}));

export default router;