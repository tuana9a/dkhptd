import { createServer } from "http";
import express from "express";
import * as amqplib from "amqplib/callback_api";
import { MongoClient, ObjectId } from "mongodb";
import { createHash } from "crypto";
import { sign } from "jsonwebtoken";
import EventEmitter from "events";

import toJson from "./dto/toJson";
import toBuffer from "./dto/toBuffer";
import SecretAuth from "./middlewares/SecretAuth";
import ObjectModifer from "./modifiers/ObjectModifier";
import config from "./config";
import loop from "./utils/loop";
import JobStatus from "./entities/JobStatus";
import DangKyHocPhanTuDongJob from "./entities/DangKyHocPhanTuDongJob";
import logger from "./loggers/logger";
import ExceptionHandlerWrapper from "./utils/ExceptionHandlerWrapper";
import toKeyValueString from "./dto/toKeyValueString";
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
import SetProp from "./dto/SetProp";
import isValidCttSisPassword from "./validations/isValidCttSisPassword";
import isValidCttSisUsername from "./validations/isValidCttSisUsername";
import InvalidCttSisUsernameError from "./exceptions/InvalidCttSisUsernameError";
import InvalidCttSisPassswordError from "./exceptions/InvalidCttSisPassswordError";
import isValidClassIds from "./validations/isValidClassIds";
import InvalidClassIdsError from "./exceptions/InvalidClassIdsError";
import ClassToRegister from "./entities/ClassToRegister";
import isValidTermId from "./validations/isValidTermId";
import InvalidTermIdError from "./exceptions/InvalidTermIdError";
import toNormalizedString from "./dto/toNormalizedString";
import DKHPTDJobLogs from "./entities/DKHPTDJobLogs";
import toSafeInt from "./dto/toSafeInt";
import getRequestAccountId from "./utils/getRequestAccountId";

const app = express();
const server = createServer(app);
const emitter = new EventEmitter();

app.use(express.json());
app.use("/", express.static("./static", { maxAge: String(7 * 24 * 60 * 60 * 1000) /* 7 day */ }));
app.use("/examples", express.static("./examples"));
app.post("/api/test/jobs/new", SecretAuth(config.SECRET), (req, resp) => {
  try {
    emitter.emit(config.NEW_JOB_EVENT_NAME, req.body);
    resp.send(req.body);
  } catch (err) {
    logger.error(err);
    resp.status(500).send(err);
  }
});

new MongoClient(config.MONGODB_CONNECTION_STRING).connect().then((client) => {
  const db = client.db(config.DATABASE_NAME);
  app.post("/api/login", ExceptionHandlerWrapper(async (req, resp) => {
    const body = new LoginWithUsernamePasswordRequest(new ObjectModifer(req.body)
      .modify(PickProps(["username", "password"]))
      .modify(NormalizeStringProp("username"))
      .modify(NormalizeStringProp("password"))
      .collect());
    const hashedPassword = createHash("sha256").update(body.password).digest("hex");
    const record = await db.collection(config.ACCOUNT_COLLECTION_NAME).findOne({ username: body.username, password: hashedPassword });
    const account = new Account(record).withId(record._id);
    const token = sign({ id: account._id }, config.SECRET, { expiresIn: "1h" });
    resp.send(new BaseResponse().ok(new LoginResponse(token)));
  }));
  app.post("/api/signup", ExceptionHandlerWrapper(async (req, resp) => {
    const body = new LoginWithUsernamePasswordRequest(new ObjectModifer(req.body)
      .modify(PickProps(["username", "password"]))
      .modify(NormalizeStringProp("username"))
      .modify(NormalizeStringProp("password"))
      .modify(ReplaceCurrentPropValueWith("password", (oldValue) => createHash("sha256").update(oldValue).digest("hex")))
      .collect());
    const isUsernameExists = await db.collection(config.ACCOUNT_COLLECTION_NAME).findOne({ username: body.username });
    if (isUsernameExists) {
      throw new UsernameExistedError(body.username);
    }
    const account = new Account(body);
    await db.collection(config.ACCOUNT_COLLECTION_NAME).insertOne(account);
    resp.send(new BaseResponse().ok(account.toClient()));
  }));

  app.get("/api/accounts/current/dkhptd-s", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["status", "timeToStart", "username"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: any = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    const jobs = await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DangKyHocPhanTuDongJob(x).toClient())));
  }));
  app.get("/api/accounts/current/dkhptd-s/:jobId/logs", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["workerId", "createdAt"], { dropFalsy: true })).collect();
    const accountId = getRequestAccountId(req);

    const filter: any = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    filter.jobId = new ObjectId(req.params.jobId);
    const logs = await db.collection(config.DKHPTD_JOB_LOGS_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobLogs(x).toClient())));
  }));
  app.get("/api/accounts/:otherAccountId/dkhptd-s", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer(req.query).modify(PickProps(["status", "timeToStart", "username"], { dropFalsy: true })).collect();
    // TODO: check privilege of account
    const filter: any = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(req.params.otherAccountId);
    const jobs = await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DangKyHocPhanTuDongJob(x).toClient())));
  }));

  app.post("/api/accounts/current/dkhptd", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const data = req.body;
    if (!data) {
      throw new MissingRequestBodyDataError();
    }

    const ownerAccountId = new ObjectId(getRequestAccountId(req));
    const safeData = new ObjectModifer(data)
      .modify(PickProps(["username", "password", "classIds", "timeToStart"]))
      .modify(NormalizeStringProp("username"))
      .modify(NormalizeStringProp("password"))
      .modify(NormalizeArrayProp("classIds", "string", ""))
      .modify(NormalizeIntProp("timeToStart"))
      .modify(SetProp("createdAt", Date.now()))
      .modify(SetProp("status", JobStatus.READY))
      .modify(SetProp("ownerAccountId", ownerAccountId))
      .collect();

    const job = new DangKyHocPhanTuDongJob(safeData);

    if (!isValidCttSisUsername(job.username)) {
      throw new InvalidCttSisUsernameError(job.username);
    }

    if (!isValidCttSisPassword(job.password)) {
      throw new InvalidCttSisPassswordError(job.password);
    }

    if (!isValidClassIds(job.classIds)) {
      throw new InvalidClassIdsError(job.classIds);
    }

    await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).insertOne(job);
    resp.send(new BaseResponse().ok(job));
  }));
  app.post("/api/accounts/current/dkhptd-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const data = req.body?.data;
    if (isFalsy(data)) {
      throw new MissingRequestBodyDataError();
    }

    if (!Array.isArray(data)) {
      throw new NotAnArrayError(data);
    }

    const ownerAccountId = new ObjectId(getRequestAccountId(req));
    const result = [];
    const jobsToInsert = [];

    for (const entry of data) {
      try {
        const safeEntry = new ObjectModifer(entry)
          .modify(PickProps(["username", "password", "classIds", "timeToStart"]))
          .modify(NormalizeStringProp("username"))
          .modify(NormalizeStringProp("password"))
          .modify(NormalizeArrayProp("classIds", "string", ""))
          .modify(NormalizeIntProp("timeToStart"))
          .modify(SetProp("createdAt", Date.now()))
          .modify(SetProp("status", JobStatus.READY))
          .modify(SetProp("ownerAccountId", ownerAccountId))
          .collect();

        const job = new DangKyHocPhanTuDongJob(safeEntry);

        if (!isValidCttSisUsername(job.username)) {
          throw new InvalidCttSisUsernameError(job.username);
        }

        if (!isValidCttSisPassword(job.password)) {
          throw new InvalidCttSisPassswordError(job.password);
        }

        if (!isValidClassIds(job.classIds)) {
          throw new InvalidClassIdsError(job.classIds);
        }

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
      await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).insertMany(jobsToInsert);
    }
    resp.send(new BaseResponse().ok(result));
  }));

  app.post("/api/accounts/current/dkhptd-s/:jobId/retry", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    const record = await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).findOne(filter);
    const newJob = new DangKyHocPhanTuDongJob(record).toRetry();
    await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).insertOne(newJob);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));
  app.put("/api/accounts/current/dkhptd-s/:jobId/cancel", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.delete("/api/accounts/current/dkhptd-s/:jobId", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = getRequestAccountId(req);
    const filter = { _id: new ObjectId(req.params.jobId), ownerAccountId: new ObjectId(accountId) };
    await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).deleteOne(filter);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.post("/api/class-to-registers", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
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
            "room",
            "learnWeek",
            "GhiChu",
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
          .modify(NormalizeStringProp("room"))
          .modify(NormalizeStringProp("learnWeek"))
          .modify(NormalizeStringProp("GhiChu"))
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

    await db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).insertMany(classToRegistersToInsert);
    resp.send(new BaseResponse().ok(result));
  }));

  app.get("/api/class-to-registers", ExceptionHandlerWrapper(async (req, resp) => {
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
        "room",
        "learnWeek",
        "termId"
      ], { dropFalsy: true }))
      .collect();
    const termId = toNormalizedString(query.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

    const filter: any = resolveFilter(String(query.q).split(","));
    filter.termId = termId;
    const classToRegisters = await db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(classToRegisters));
  }));
  app.get("/api/class-to-registers/:id", ExceptionHandlerWrapper(async (req, resp) => {
    const id = toNormalizedString(req.params.id);
    const filter = { _id: new ObjectId(id) };
    const classToRegister = await db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).findOne(filter);
    resp.send(new BaseResponse().ok(classToRegister));
  }));
  app.get("/api/class-to-registers/class-ids", ExceptionHandlerWrapper(async (req, resp) => {
    const classIds = toNormalizedString(req.query.classIds).split(",").map((x) => toNormalizedString(x));
    const termId = toNormalizedString(req.query.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

    const filter = { classId: { $in: classIds }, termId: termId };
    const classToRegisters = await db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).find(filter).toArray();
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
    const classToRegisters = await db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(classToRegisters));
  }));
  app.get("/api/class-to-registers/class-ids/:classId", ExceptionHandlerWrapper(async (req, resp) => {
    const classId = toNormalizedString(req.params.classId);
    const termId = toNormalizedString(req.query.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

    const filter = { classId: classId, termId: termId };
    const classToRegister = await db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).findOne(filter);
    resp.send(new BaseResponse().ok(classToRegister));
  }));

  app.delete("/api/class-to-registers", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
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
        "room",
        "learnWeek",
        "termId"
      ], { dropFalsy: true }))
      .collect();
    const termId = toNormalizedString(query.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

    const filter: any = resolveFilter(String(query.q).split(","));
    filter.termId = termId;
    const deleteResult = await db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).deleteMany(filter);
    resp.send(new BaseResponse().ok(deleteResult.deletedCount));
  }));
  app.delete("/api/class-to-registers", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
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
        "room",
        "learnWeek",
        "termId"
      ], { dropFalsy: true })).collect();
    const termId = toNormalizedString(query.termId);

    if (!isValidTermId(termId)) {
      throw new InvalidTermIdError(termId);
    }

    const filter: any = resolveFilter(String(query.q).split(","));
    filter.termId = termId;
    const deleteResult = await db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).deleteMany(filter);
    resp.send(new BaseResponse().ok(deleteResult.deletedCount));
  }));
  app.delete("/api/duplicate-class-to-registers", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const cursor = db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).find();
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
      const cursor = db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).find({ classId, learnDayNumber, termId }).sort({ createdAt: -1 }).limit(1);
      if (await cursor.hasNext()) {
        const newestClassToRegister = await cursor.next();
        const newestClassToRegisterCreatedAt = newestClassToRegister.createdAt;
        const deleteResult = await db.collection(config.CLASS_TO_REGISTER_COLLECTION_NAME).deleteMany({ classId, learnDayNumber, termId, createdAt: { $ne: newestClassToRegisterCreatedAt } });
        deletedCount += deleteResult.deletedCount;
      }
    }

    resp.send(new BaseResponse().ok(deletedCount));
  }));

  emitter.on(config.NEW_JOB_RESULT_EVENT_NAME, async (result) => {
    try {
      logger.info(`Received Job Result: ${result.id}`);
      const jobId = new ObjectId(result.id);
      const job = await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).findOne({ _id: jobId });

      if (job) {
        await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });
        const logs = new DKHPTDJobLogs({
          jobId,
          workerId: result.workerId,
          ownerAccountId: job.ownerAccountId,
          logs: result.logs,
          createdAt: Date.now(),
        });
        await db.collection(config.DKHPTD_JOB_LOGS_COLLECTION_NAME).insertOne(logs);
      }
    } catch (err) {
      logger.error(err);
    }
  });

  loop.infinity(async () => {
    try {
      const cursor = db.collection(config.DKHPTD_JOB_COLLECTION_NAME).find({
        timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
        status: JobStatus.READY,
      }, { sort: { timeToStart: 1 } });
      while (await cursor.hasNext()) {
        const entry = await cursor.next();
        const job = new DangKyHocPhanTuDongJob(entry);
        emitter.emit(config.NEW_JOB_EVENT_NAME, {
          name: "DangKyHocPhanTuDong",
          params: {
            username: job.username,
            password: job.password,
            classIds: job.classIds,
          },
        });
        await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).updateOne({ _id: new ObjectId(job._id) }, {
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
    emitter.on(config.NEW_JOB_EVENT_NAME, (job) => channel.sendToQueue(config.DKHPTD_JOBS_QUEUE_NAME, toBuffer(job)));

    channel.assertQueue(config.DKHPTD_JOBS_QUEUE_NAME);
    channel.assertExchange(config.DKHPTD_WORKER_DOING_EXCHANGE_NAME, "fanout", { durable: false });
    channel.assertExchange(config.DKHPTD_WORKER_PING_EXCHANGE_NAME, "fanout", { durable: false });

    // result queue
    channel.assertQueue(config.DKHPTD_JOB_RESULT_QUEUE_NAME, null, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(msg.content.toString());
          emitter.emit(config.NEW_JOB_RESULT_EVENT_NAME, result);
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

      channel.bindQueue(q.queue, config.DKHPTD_WORKER_PING_EXCHANGE_NAME, "");
      channel.consume(q.queue, async (msg) => {
        try {
          const ping = JSON.parse(msg.content.toString());
          emitter.emit(config.PING_EVENT_NAME, ping);
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

      channel.bindQueue(q.queue, config.DKHPTD_WORKER_DOING_EXCHANGE_NAME, "");
      channel.consume(q.queue, async (msg) => {
        try {
          const doing = JSON.parse(msg.content.toString());
          emitter.emit(config.DOING_EVENT_NAME, doing);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });
  });
});

emitter.on(config.DOING_EVENT_NAME, (doing) => logger.info(`Doing: ${toJson(doing)}`));
emitter.on(config.PING_EVENT_NAME, (ping) => logger.info(`Ping: ${toJson(ping, null)}`));

logger.info(`Config: \n${toKeyValueString(config)}`);
server.listen(config.PORT);
