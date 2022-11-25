import http from "http";
import crypto from "crypto";
import express from "express";
import multer from "multer";
import * as amqplib from "amqplib/callback_api";
import { Filter, MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import EventEmitter from "events";

import toJson from "./utils/toJson";
import toBuffer from "./utils/toBuffer";
import SecretFilter from "./middlewares/SecretFilter";
import ObjectModifer from "./modifiers/ObjectModifier";
import config from "./config";
import loop from "./utils/loop";
import JobStatus from "./configs/JobStatus";
import DKHPTDJob from "./entities/DKHPTDJob";
import logger from "./loggers/logger";
import ExceptionHandlerWrapper from "./utils/ExceptionHandlerWrapper";
import toKeyValueString from "./utils/toKeyValueString";
import LoginWithUsernamePasswordRequest from "./payloads/LoginWithUsernamePasswordRequest";
import PickProps from "./modifiers/PickProps";
import NormalizeArrayProp from "./modifiers/NormalizeArrayProp";
import NormalizeIntProp from "./modifiers/NormalizeIntProp";
import NormalizeStringProp from "./modifiers/NormalizeStringProp";
import Account from "./entities/Account";
import BaseResponse from "./payloads/BaseResponse";
import LoginResponse from "./payloads/LoginResponse";
import ReplaceCurrentPropValueWith from "./modifiers/ReplaceCurrentPropValueWith";
import UsernameExistedError from "./exceptions/UsernameExistedError";
import JwtFilter from "./middlewares/JwtFilter";
import resolveFilter from "./utils/resolveMongoFilter";
import RateLimit from "./middlewares/RateLimit";
import isFalsy from "./validations/isFalsy";
import MissingRequestBodyDataError from "./exceptions/MissingRequestBodyDataError";
import NotAnArrayError from "./exceptions/NotAnArrayError";
import SetProp from "./modifiers/SetProp";
import isValidCttSisPassword from "./validations/isValidCttSisPassword";
import isValidCttSisUsername from "./validations/isValidCttSisUsername";
import InvalidCttSisUsernameError from "./exceptions/InvalidCttSisUsernameError";
import InvalidCttSisPassswordError from "./exceptions/InvalidCttSisPassswordError";
import isValidClassIds from "./validations/isValidClassIds";
import InvalidClassIdsError from "./exceptions/InvalidClassIdsError";
import ClassToRegister from "./entities/ClassToRegister";
import isValidTermId from "./validations/isValidTermId";
import InvalidTermIdError from "./exceptions/InvalidTermIdError";
import toNormalizedString from "./utils/toNormalizedString";
import DKHPTDJobLogs from "./entities/DKHPTDJobLogs";
import toSafeInt from "./utils/toSafeInt";
import getRequestAccountId from "./utils/getRequestAccountId";
import DKHPTDJobV1 from "./entities/DKHPTDJobV1";
import AccountNotFoundError from "./exceptions/AccountNotFoundError";
import JobNotFoundError from "./exceptions/JobNotFoundError";
import MissingTimeToStartError from "./exceptions/MissingTimeToStartError";
import toSHA256 from "./utils/toSHA256";
import DKHPTDJobV1Logs from "./entities/DKHPTDJobV1Logs";
import { c } from "./utils/cypher";
import AppEvent from "./configs/AppEvent";
import ExchangeName from "./configs/ExchangeName";
import QueueName from "./configs/QueueName";
import ParsedClassToRegister from "./payloads/ParsedClassToRegister";
import DKHPTDJobV2 from "./entities/DKHPTDJobV2";
import DKHPTDJobV2Logs from "./entities/DKHPTDJobV2Logs";
import isValidClassIdsV2 from "./validations/isValidClassIdsV2";

const app = express();
const server = http.createServer(app);
const emitter = new EventEmitter();

app.use(express.json());

new MongoClient(config.MONGODB_CONNECTION_STRING).connect().then((client) => {
  const db = client.db(config.DATABASE_NAME);
  app.post("/api/login", ExceptionHandlerWrapper(async (req, resp) => {
    const body = new LoginWithUsernamePasswordRequest(new ObjectModifer(req.body)
      .modify(PickProps(["username", "password"]))
      .modify(NormalizeStringProp("username"))
      .modify(NormalizeStringProp("password"))
      .collect());
    const hashedPassword = toSHA256(body.password);
    const account = await db.collection(Account.name).findOne({ username: body.username, password: hashedPassword });

    if (!account) throw new AccountNotFoundError();

    const token = jwt.sign({ id: account._id }, config.SECRET, { expiresIn: "1h" });
    resp.send(new BaseResponse().ok(new LoginResponse(token)));
  }));
  app.post("/api/signup", ExceptionHandlerWrapper(async (req, resp) => {
    const body = new LoginWithUsernamePasswordRequest(new ObjectModifer(req.body)
      .modify(PickProps(["username", "password"]))
      .modify(NormalizeStringProp("username"))
      .modify(NormalizeStringProp("password"))
      .modify(ReplaceCurrentPropValueWith("password", (oldValue) => toSHA256(oldValue)))
      .collect());
    const isUsernameExists = await db.collection(Account.name).findOne({ username: body.username });
    if (isUsernameExists) {
      throw new UsernameExistedError(body.username);
    }
    const account = new Account(body);
    await db.collection(Account.name).insertOne(account);
    resp.send(new BaseResponse().ok(account.toClient()));
  }));

  app.get("/api/accounts/current", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);

    const filter: Filter<Account> = { _id: new ObjectId(accountId) };
    const account = await db.collection(Account.name).findOne(filter);

    if (isFalsy(account)) throw new AccountNotFoundError(accountId);

    resp.send(new BaseResponse().ok(new Account(account).toClient()));
  }));
  app.put("/api/accounts/current/password", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const body = new ObjectModifer(req.body)
      .modify(PickProps(["password"]))
      .modify(NormalizeStringProp("password"))
      .modify(ReplaceCurrentPropValueWith("password", (oldValue) => toSHA256(oldValue)))
      .collect();
    const newHashedPassword = body.password;

    const filter: Filter<Account> = { _id: new ObjectId(accountId) };
    const account = await db.collection(Account.name).findOne(filter);

    if (isFalsy(account)) throw new AccountNotFoundError(accountId);

    await db.collection(Account.name).updateOne(filter, { $set: { password: newHashedPassword } });
    resp.send(new BaseResponse().ok(new Account(account).toClient()));
  }));

  app.get("/api/accounts/current/dkhptd-s", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJob> = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    const jobs = await db.collection(DKHPTDJob.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJob(x).toClient())));
  }));
  app.get("/api/accounts/current/dkhptd-s/:jobId/logs", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJobLogs> = {
      ownerAccountId: new ObjectId(accountId),
      jobId: new ObjectId(req.params.jobId),
    };
    const logs = await db.collection(DKHPTDJobLogs.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobLogs(x).toClient())));
  }));

  app.post("/api/accounts/current/dkhptd", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
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

    if (!isValidCttSisUsername(job.username)) throw new InvalidCttSisUsernameError(job.username);
    if (!isValidCttSisPassword(job.password)) throw new InvalidCttSisPassswordError(job.password);
    if (!isValidClassIds(job.classIds)) throw new InvalidClassIdsError(job.classIds);
    if (isFalsy(job.timeToStart)) throw new MissingTimeToStartError();

    await db.collection(DKHPTDJob.name).insertOne(job);
    resp.send(new BaseResponse().ok(job));
  }));
  app.post("/api/accounts/current/dkhptd-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const data = req.body?.data;
    if (isFalsy(data)) throw new MissingRequestBodyDataError();

    if (!Array.isArray(data)) throw new NotAnArrayError(data);

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

        if (!isValidCttSisUsername(job.username)) throw new InvalidCttSisUsernameError(job.username);
        if (!isValidCttSisPassword(job.password)) throw new InvalidCttSisPassswordError(job.password);
        if (!isValidClassIds(job.classIds)) throw new InvalidClassIdsError(job.classIds);
        if (isFalsy(job.timeToStart)) throw new MissingTimeToStartError();

        jobsToInsert.push(job);
        result.push(new BaseResponse().ok(job));
      } catch (err) {
        if (err.__isSafeError) {
          result.push(err.toBaseResponse());
        } else {
          result.push(new BaseResponse().failed(err).withMessage(err.message));
        }
      }
    }

    if (jobsToInsert.length !== 0) {
      await db.collection(DKHPTDJob.name).insertMany(jobsToInsert);
    }
    resp.send(new BaseResponse().ok(result));
  }));

  app.post("/api/accounts/current/dkhptd-s/:jobId/retry", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter: Filter<DKHPTDJob> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    const existedJob = await db.collection(DKHPTDJob.name).findOne(filter);

    if (isFalsy(existedJob)) throw new JobNotFoundError(req.params.jobId);

    const newJob = new DKHPTDJob(existedJob).toRetry();
    await db.collection(DKHPTDJob.name).insertOne(newJob);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));
  app.put("/api/accounts/current/dkhptd-s/:jobId/cancel", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter: Filter<DKHPTDJob> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    await db.collection(DKHPTDJob.name).findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.delete("/api/accounts/current/dkhptd-s/:jobId", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter: Filter<DKHPTDJob> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    await db.collection(DKHPTDJob.name).deleteOne(filter);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.get("/api/accounts/current/dkhptdv1-s", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJobV1> = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    const jobs = await db.collection(DKHPTDJobV1.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJobV1(x).toClient())));
  }));
  app.get("/api/accounts/current/d/dkhptdv1-s", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJobV1> = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    const jobs = await db.collection(DKHPTDJobV1.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJobV1(x).decrypt().toClient())));
  }));
  app.get("/api/accounts/current/dkhptdv1-s/:jobId/logs", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJobV1Logs> = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    filter.jobId = new ObjectId(req.params.jobId);
    const logs = await db.collection(DKHPTDJobV1Logs.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV1Logs(x).toClient())));
  }));
  app.get("/api/accounts/current/dkhptdv1-s/:jobId/d/logs", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJobV1Logs> = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    filter.jobId = new ObjectId(req.params.jobId);
    const logs = await db.collection(DKHPTDJobV1Logs.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV1Logs(x).decrypt().toClient())));
  }));

  app.post("/api/accounts/current/dkhptdv1", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
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

    const job = new DKHPTDJobV1(safeData);

    if (!isValidCttSisUsername(job.username)) throw new InvalidCttSisUsernameError(job.username);
    if (!isValidCttSisPassword(job.password)) throw new InvalidCttSisPassswordError(job.password);
    if (!isValidClassIds(job.classIds)) throw new InvalidClassIdsError(job.classIds);
    if (isFalsy(job.timeToStart)) throw new MissingTimeToStartError();

    const eJob = job.encrypt();
    await db.collection(DKHPTDJobV1.name).insertOne(eJob);
    resp.send(new BaseResponse().ok(job));
  }));
  app.post("/api/accounts/current/dkhptdv1-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const data = req.body?.data;

    if (isFalsy(data)) throw new MissingRequestBodyDataError();
    if (!Array.isArray(data)) throw new NotAnArrayError(data);

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

        const job = new DKHPTDJobV1(safeEntry);

        if (!isValidCttSisUsername(job.username)) throw new InvalidCttSisUsernameError(job.username);
        if (!isValidCttSisPassword(job.password)) throw new InvalidCttSisPassswordError(job.password);
        if (!isValidClassIds(job.classIds)) throw new InvalidClassIdsError(job.classIds);
        if (isFalsy(job.timeToStart)) throw new MissingTimeToStartError();

        jobsToInsert.push(job);
        result.push(new BaseResponse().ok(job));
      } catch (err) {
        if (err.__isSafeError) {
          result.push(err.toBaseResponse());
        } else {
          result.push(new BaseResponse().failed(err).withMessage(err.message));
        }
      }
    }

    if (jobsToInsert.length !== 0) {
      const eJobsToInsert = jobsToInsert.map((x) => x.encrypt());
      await db.collection(DKHPTDJobV1.name).insertMany(eJobsToInsert);
    }
    resp.send(new BaseResponse().ok(result));
  }));

  app.post("/api/accounts/current/dkhptdv1-s/:jobId/retry", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    const existedJob = await db.collection(DKHPTDJobV1.name).findOne(filter);

    if (!existedJob) throw new JobNotFoundError(req.params.jobId);

    const newJob = new DKHPTDJobV1(existedJob).decrypt().toRetry();
    const eNewJob = newJob.encrypt();
    await db.collection(DKHPTDJobV1.name).insertOne(eNewJob);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));
  app.put("/api/accounts/current/dkhptdv1-s/:jobId/cancel", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    await db.collection(DKHPTDJobV1.name).findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.delete("/api/accounts/current/dkhptdv1-s/:jobId", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    await db.collection(DKHPTDJobV1.name).deleteOne(filter);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.get("/api/accounts/current/dkhptdv2-s", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJobV2> = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    const jobs = await db.collection(DKHPTDJobV2.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJobV2(x).toClient())));
  }));
  app.get("/api/accounts/current/d/dkhptdv2-s", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJobV2> = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    const jobs = await db.collection(DKHPTDJobV2.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DKHPTDJobV2(x).decrypt().toClient())));
  }));
  app.get("/api/accounts/current/dkhptdv2-s/:jobId/logs", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJobV2Logs> = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    filter.jobId = new ObjectId(req.params.jobId);
    const logs = await db.collection(DKHPTDJobV2Logs.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV2Logs(x).toClient())));
  }));
  app.get("/api/accounts/current/dkhptdv2-s/:jobId/d/logs", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: Filter<DKHPTDJobV2Logs> = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    filter.jobId = new ObjectId(req.params.jobId);
    const logs = await db.collection(DKHPTDJobV2Logs.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV2Logs(x).decrypt().toClient())));
  }));

  app.post("/api/accounts/current/dkhptdv2", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
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

    const job = new DKHPTDJobV2(safeData);

    if (!isValidCttSisUsername(job.username)) throw new InvalidCttSisUsernameError(job.username);
    if (!isValidCttSisPassword(job.password)) throw new InvalidCttSisPassswordError(job.password);
    if (!isValidClassIdsV2(job.classIds)) throw new InvalidClassIdsError(job.classIds);
    if (isFalsy(job.timeToStart)) throw new MissingTimeToStartError();

    const eJob = job.encrypt();
    await db.collection(DKHPTDJobV2.name).insertOne(eJob);
    resp.send(new BaseResponse().ok(job));
  }));
  app.post("/api/accounts/current/dkhptdv2-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const data = req.body?.data;

    if (isFalsy(data)) throw new MissingRequestBodyDataError();
    if (!Array.isArray(data)) throw new NotAnArrayError(data);

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

        const job = new DKHPTDJobV2(safeEntry);

        if (!isValidCttSisUsername(job.username)) throw new InvalidCttSisUsernameError(job.username);
        if (!isValidCttSisPassword(job.password)) throw new InvalidCttSisPassswordError(job.password);
        if (!isValidClassIdsV2(job.classIds)) throw new InvalidClassIdsError(job.classIds);
        if (isFalsy(job.timeToStart)) throw new MissingTimeToStartError();

        jobsToInsert.push(job);
        result.push(new BaseResponse().ok(job));
      } catch (err) {
        if (err.__isSafeError) {
          result.push(err.toBaseResponse());
        } else {
          result.push(new BaseResponse().failed(err).withMessage(err.message));
        }
      }
    }

    if (jobsToInsert.length !== 0) {
      const eJobsToInsert = jobsToInsert.map((x) => x.encrypt());
      await db.collection(DKHPTDJobV2.name).insertMany(eJobsToInsert);
    }
    resp.send(new BaseResponse().ok(result));
  }));

  app.post("/api/accounts/current/dkhptdv2-s/:jobId/retry", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter: Filter<DKHPTDJobV2> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    const existedJob = await db.collection(DKHPTDJobV2.name).findOne(filter);

    if (!existedJob) throw new JobNotFoundError(req.params.jobId);

    const newJob = new DKHPTDJobV2(existedJob).decrypt().toRetry();
    const eNewJob = newJob.encrypt();
    await db.collection(DKHPTDJobV2.name).insertOne(eNewJob);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));
  app.put("/api/accounts/current/dkhptdv1-s/:jobId/cancel", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter: Filter<DKHPTDJobV2> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    await db.collection(DKHPTDJobV2.name).findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.delete("/api/accounts/current/dkhptdv1-s/:jobId", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter: Filter<DKHPTDJobV2> = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    await db.collection(DKHPTDJobV2.name).deleteOne(filter);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.post("/api/class-to-registers", SecretFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const data = req.body?.data;
    if (isFalsy(data)) {
      throw new MissingRequestBodyDataError();
    }

    if (!Array.isArray(data)) {
      throw new NotAnArrayError(data);
    }

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

        if (!isValidTermId(classToRegister.termId)) {
          throw new InvalidTermIdError(classToRegister.termId);
        }
        classToRegistersToInsert.push(classToRegister);
        result.push(new BaseResponse().ok(classToRegister));
      } catch (err) {
        if (err.__isSafeError) {
          result.push(err.toBaseResponse());
        } else {
          result.push(new BaseResponse().failed(err).withMessage(err.message));
        }
      }
    }

    await db.collection(ClassToRegister.name).insertMany(classToRegistersToInsert);
    resp.send(new BaseResponse().ok(result));
  }));
  app.post("/api/class-to-register-file", SecretFilter(config.SECRET), multer({ limits: { fileSize: 5 * 1000 * 1000 /* 5mb */ } }).single("file"), ExceptionHandlerWrapper(async (req, resp) => {
    const file = req.file;
    emitter.emit(AppEvent.CLASS_TO_REGISTER_FILE_UPLOADED, file.buffer);
    resp.send(new BaseResponse().ok());
  }));

  app.get("/api/term-ids/:termId/class-to-registers", ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const termId = toNormalizedString(req.params.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

    const filter: Filter<ClassToRegister> = resolveFilter(String(query.q).split(","));
    filter.termId = termId;
    const classToRegisters = await db.collection(ClassToRegister.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(classToRegisters));
  }));
  app.get("/api/term-ids/:termId/class-to-registers/:id", ExceptionHandlerWrapper(async (req, resp) => {
    const id = toNormalizedString(req.params.id);
    const termId = toNormalizedString(req.params.termId);
    const filter: Filter<ClassToRegister> = { _id: new ObjectId(id) };
    filter.termId = termId;
    const classToRegister = await db.collection(ClassToRegister.name).findOne(filter);
    resp.send(new BaseResponse().ok(classToRegister));
  }));
  app.get("/api/class-to-registers/class-ids", ExceptionHandlerWrapper(async (req, resp) => {
    const classIds = toNormalizedString(req.query.classIds).split(",").map((x) => toNormalizedString(x));
    const termId = toNormalizedString(req.query.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

    const filter = { classId: { $in: classIds }, termId: termId };
    const classToRegisters = await db.collection(ClassToRegister.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(classToRegisters));
  }));
  app.get("/api/class-to-registers/class-ids/start-withs", ExceptionHandlerWrapper(async (req, resp) => {
    const classIds = toNormalizedString(req.query.classIds).split(",").map((x) => toNormalizedString(x));
    const termId = toNormalizedString(req.query.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

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
    const classToRegisters = await db.collection(ClassToRegister.name).find(filter).toArray();
    resp.send(new BaseResponse().ok(classToRegisters));
  }));
  app.get("/api/class-to-registers/class-ids/:classId", ExceptionHandlerWrapper(async (req, resp) => {
    const classId = toNormalizedString(req.params.classId);
    const termId = toNormalizedString(req.query.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

    const filter = { classId: classId, termId: termId };
    const classToRegister = await db.collection(ClassToRegister.name).findOne(filter);
    resp.send(new BaseResponse().ok(classToRegister));
  }));

  app.delete("/api/class-to-registers", SecretFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
    const filter: Filter<ClassToRegister> = resolveFilter(String(query.q).split(","));
    const deleteResult = await db.collection(ClassToRegister.name).deleteMany(filter);
    resp.send(new BaseResponse().ok(deleteResult.deletedCount));
  }));
  app.delete("/api/class-to-registers", SecretFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query)
      .modify(PickProps([
        "classId",
        "secondClassId",
        "classType",
        "subjectId",
        "subjectName",
        "learnDayNumber",
        "learnAtDayOfWeek",
        "learnTime",
        "learnRoom",
        "learnWeek",
        "termId"
      ], { dropFalsy: true })).collect();
    const termId = toNormalizedString(query.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

    const filter: Filter<ClassToRegister> = resolveFilter(String(query.q).split(","));
    filter.termId = termId;
    const deleteResult = await db.collection(ClassToRegister.name).deleteMany(filter);
    resp.send(new BaseResponse().ok(deleteResult.deletedCount));
  }));
  app.delete("/api/duplicate-class-to-registers", SecretFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const cursor = db.collection(ClassToRegister.name).find();
    const ids = new Set<string>();
    const delimiter = "::";
    let deletedCount = 0;

    while (await cursor.hasNext()) {
      const classToRegister = await cursor.next();
      const { classId, learnDayNumber, termId } = classToRegister;
      ids.add([termId, classId, learnDayNumber].join(delimiter));
    }

    for (const id of ids) {
      const [termId, classId, learnDayNumber] = id.split(delimiter);
      const cursor = db.collection(ClassToRegister.name).find({ classId, learnDayNumber, termId }).sort({ createdAt: -1 }).limit(1);
      if (await cursor.hasNext()) {
        const newestClassToRegister = await cursor.next();
        const newestClassToRegisterCreatedAt = newestClassToRegister.createdAt;
        const deleteResult = await db.collection(ClassToRegister.name).deleteMany({ classId, learnDayNumber, termId, createdAt: { $ne: newestClassToRegisterCreatedAt } });
        deletedCount += deleteResult.deletedCount;
      }
    }

    resp.send(new BaseResponse().ok(deletedCount));
  }));

  emitter.on(AppEvent.NEW_JOB_RESULT, async (result) => {
    try {
      logger.info(`Received job result: ${result.id}`);
      const jobId = new ObjectId(result.id);
      const job = await db.collection(DKHPTDJob.name).findOne({ _id: jobId });

      if (!job) {
        logger.warn(`Job ${result.id} not found for job result`);
        return;
      }

      await db.collection(DKHPTDJob.name).updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });
      const logs = new DKHPTDJobLogs({
        jobId,
        workerId: result.workerId,
        ownerAccountId: job.ownerAccountId,
        logs: result.logs,
        createdAt: Date.now(),
      });
      await db.collection(DKHPTDJobLogs.name).insertOne(logs);
    } catch (err) {
      logger.error(err);
    }
  });

  emitter.on(AppEvent.NEW_JOB_V1_RESULT, async (result) => {
    try {
      logger.info(`Received job v1 result: ${result.id}`);
      const jobId = new ObjectId(result.id);
      const job = await db.collection(DKHPTDJobV1.name).findOne({ _id: jobId });

      if (!job) {
        logger.warn(`Job ${result.id} not found for job result`);
        return;
      }
      await db.collection(DKHPTDJobV1.name).updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });
      const newIv = crypto.randomBytes(16).toString("hex");
      const logs = new DKHPTDJobV1Logs({
        jobId,
        workerId: result.workerId,
        ownerAccountId: job.ownerAccountId,
        logs: c(config.JOB_ENCRYPTION_KEY).e(toJson(result.logs), newIv),
        createdAt: Date.now(),
        iv: newIv,
      });
      await db.collection(DKHPTDJobV1Logs.name).insertOne(logs);
    } catch (err) {
      logger.error(err);
    }
  });

  emitter.on(AppEvent.NEW_JOB_V2_RESULT, async (result) => {
    try {
      logger.info(`Received job v2 result: ${result.id}`);
      const jobId = new ObjectId(result.id);
      const job = await db.collection(DKHPTDJobV2.name).findOne({ _id: jobId });

      if (!job) {
        logger.warn(`Job ${result.id} not found for job result`);
        return;
      }
      await db.collection(DKHPTDJobV2.name).updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });
      const newIv = crypto.randomBytes(16).toString("hex");
      const logs = new DKHPTDJobV2Logs({
        jobId,
        workerId: result.workerId,
        ownerAccountId: job.ownerAccountId,
        logs: c(config.JOB_ENCRYPTION_KEY).e(toJson(result.logs), newIv),
        createdAt: Date.now(),
        iv: newIv,
      });
      await db.collection(DKHPTDJobV2Logs.name).insertOne(logs);
    } catch (err) {
      logger.error(err);
    }
  });

  emitter.on(AppEvent.CLASS_TO_REGISTER_FILE_PARSED, async (result: { data: ParsedClassToRegister[] }) => {
    try {
      logger.info(`Received parsed class to register, count: ${result.data.length}`);
      const classes = result.data.map(x => new ParsedClassToRegister(x))
        .map(x => x.toCTR())
        .map(x => new ObjectModifer(x)
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
          .collect())
        .map(x => new ClassToRegister(x));
      await db.collection(ClassToRegister.name).insertMany(classes);
    } catch (err) {
      logger.error(err);
    }
  });

  loop.infinity(async () => {
    try {
      const cursor = db.collection(DKHPTDJob.name).find({
        timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
        status: JobStatus.READY,
      }, { sort: { timeToStart: 1 } });
      while (await cursor.hasNext()) {
        const entry = await cursor.next();
        const job = new DKHPTDJob(entry);
        emitter.emit(AppEvent.NEW_JOB, {
          name: "DangKyHocPhanTuDong",
          params: {
            username: job.username,
            password: job.password,
            classIds: job.classIds,
          },
        });
        await db.collection(DKHPTDJob.name).updateOne({ _id: new ObjectId(job._id) }, {
          $set: {
            status: JobStatus.DOING,
            doingAt: Date.now(),
          },
        });
      }
    } catch (err) {
      logger.error(err);
    }
  }, 10_000);

  loop.infinity(async () => {
    try {
      const cursor = db.collection(DKHPTDJobV1.name).find({
        timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
        status: JobStatus.READY,
      }, { sort: { timeToStart: 1 } });
      while (await cursor.hasNext()) {
        const entry = await cursor.next();
        const job = new DKHPTDJobV1(entry).decrypt();
        emitter.emit(AppEvent.NEW_JOB_V1, job.toWorker());
        await db.collection(DKHPTDJobV1.name).updateOne({ _id: new ObjectId(job._id) }, {
          $set: {
            status: JobStatus.DOING,
            doingAt: Date.now(),
          },
        });
      }
    } catch (err) {
      logger.error(err);
    }
  }, 10_000);

  loop.infinity(async () => {
    try {
      const cursor = db.collection(DKHPTDJobV2.name).find({
        timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
        status: JobStatus.READY,
      }, { sort: { timeToStart: 1 } });
      while (await cursor.hasNext()) {
        const entry = await cursor.next();
        const job = new DKHPTDJobV2(entry).decrypt();
        emitter.emit(AppEvent.NEW_JOB_V2, job.toWorker());
        await db.collection(DKHPTDJobV2.name).updateOne({ _id: new ObjectId(job._id) }, {
          $set: {
            status: JobStatus.DOING,
            doingAt: Date.now(),
          },
        });
      }
    } catch (err) {
      logger.error(err);
    }
  }, 10_000);
});

amqplib.connect(config.RABBITMQ_CONNECTION_STRING, (error0, connection) => {
  if (error0) {
    logger.error(error0);
    return;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      logger.error(error1);
      return;
    }
    emitter.on(AppEvent.NEW_JOB, (job) => {
      logger.info("new Job: " + toJson(job));
      channel.sendToQueue(QueueName.DKHPTD_JOBS, toBuffer(toJson(job)));
    });

    emitter.on(AppEvent.NEW_JOB_V1, (job) => {
      logger.info("new Job V1: " + toJson(job));
      const iv = crypto.randomBytes(16).toString("hex");
      channel.sendToQueue(QueueName.DKHPTD_JOBS_V1, toBuffer(c(config.AMQP_ENCRYPTION_KEY).e(toJson(job), iv)), {
        headers: {
          iv: iv,
        }
      });
    });

    emitter.on(AppEvent.NEW_JOB_V2, (job) => {
      logger.info("new Job V2: " + toJson(job));
      const iv = crypto.randomBytes(16).toString("hex");
      channel.sendToQueue(QueueName.DKHPTD_JOBS_V2, toBuffer(c(config.AMQP_ENCRYPTION_KEY).e(toJson(job), iv)), {
        headers: {
          iv: iv,
        }
      });
    });

    emitter.on(AppEvent.CLASS_TO_REGISTER_FILE_UPLOADED, (buffer: Buffer) => {
      logger.info("new Parse XLSX Job");
      channel.sendToQueue(QueueName.DKHPTD_PARSE_CLASS_TO_REGISTER_XLSX_JOBS, buffer);
    });

    channel.assertQueue(QueueName.DKHPTD_JOBS, { durable: false });
    channel.assertQueue(QueueName.DKHPTD_JOBS_RESULT, { durable: false });

    channel.assertQueue(QueueName.DKHPTD_JOBS_V1, { durable: false });
    channel.assertQueue(QueueName.DKHPTD_JOBS_V1_RESULT, { durable: false });

    channel.assertQueue(QueueName.DKHPTD_JOBS_V2, { durable: false });
    channel.assertQueue(QueueName.DKHPTD_JOBS_V2_RESULT, { durable: false });

    channel.assertQueue(QueueName.DKHPTD_PARSE_CLASS_TO_REGISTER_XLSX_JOBS, { durable: false });
    channel.assertQueue(QueueName.DKHPTD_PARSE_CLASS_TO_REGISTER_XLSX_JOBS_RESULT, { durable: false });

    channel.assertExchange(ExchangeName.DKHPTD_WORKER_DOING, "fanout", { durable: false });
    channel.assertExchange(ExchangeName.DKHPTD_WORKER_PING, "fanout", { durable: false });

    // result queue
    channel.assertQueue(QueueName.DKHPTD_JOBS_RESULT, { durable: false }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(msg.content.toString());
          emitter.emit(AppEvent.NEW_JOB_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    channel.assertQueue(QueueName.DKHPTD_JOBS_V1_RESULT, { durable: false }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(c(config.AMQP_ENCRYPTION_KEY).d(msg.content.toString(), msg.properties.headers.iv));
          emitter.emit(AppEvent.NEW_JOB_V1_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    channel.assertQueue(QueueName.DKHPTD_JOBS_V2_RESULT, { durable: false }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(c(config.AMQP_ENCRYPTION_KEY).d(msg.content.toString(), msg.properties.headers.iv));
          emitter.emit(AppEvent.NEW_JOB_V2_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    channel.assertQueue(QueueName.DKHPTD_PARSE_CLASS_TO_REGISTER_XLSX_JOBS_RESULT, { durable: false }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(msg.content.toString());
          emitter.emit(AppEvent.CLASS_TO_REGISTER_FILE_PARSED, result);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    channel.assertQueue("", { exclusive: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.bindQueue(q.queue, ExchangeName.DKHPTD_WORKER_PING, "");
      channel.consume(q.queue, async (msg) => {
        try {
          const ping = JSON.parse(msg.content.toString());
          emitter.emit(AppEvent.PING, ping);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    channel.assertQueue("", { exclusive: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.bindQueue(q.queue, ExchangeName.DKHPTD_WORKER_DOING, "");
      channel.consume(q.queue, async (msg) => {
        try {
          const doing = JSON.parse(msg.content.toString());
          emitter.emit(AppEvent.DOING, doing);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });
  });
});

emitter.on(AppEvent.DOING, (doing) => logger.info(`Doing: ${toJson(doing)}`));
emitter.on(AppEvent.PING, (ping) => logger.info(`Ping: ${toJson(ping)}`));

logger.info(`Config: \n${toKeyValueString(config)}`);
server.listen(config.PORT);
