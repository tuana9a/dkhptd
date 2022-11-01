const http = require("http");
const express = require("express");
const amqp = require("amqplib/callback_api");
const mongodb = require("mongodb");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const EventEmitter = require("events");

const toJson = require("./dto/toJson");
const toBuffer = require("./dto/toBuffer");
const SecretAuth = require("./middlewares/SecretAuth");
const ObjectModifer = require("./modifiers/ObjectModifier");
const config = require("./config");
const loop = require("./utils/loop");
const JobStatus = require("./entities/JobStatus");
const DangKyHocPhanTuDongJob = require("./entities/DangKyHocPhanTuDongJob");
const logger = require("./loggers/logger");
const ExceptionHandlerWrapper = require("./utils/ExceptionHandlerWrapper");
const toKeyValueString = require("./dto/toKeyValueString");
const LoginWithUsernamePasswordRequest = require("./payloads/LoginWithUsernamePasswordRequest");
const PickProps = require("./modifiers/PickProps");
const NormalizeArrayProp = require("./modifiers/NormalizeArrayProp");
const NormalizeIntProp = require("./modifiers/NormalizeIntProp");
const NormalizeStringProp = require("./modifiers/NormalizeStringProp");
const Account = require("./entities/Account");
const BaseResponse = require("./payloads/BaseResponse");
const LoginResponse = require("./payloads/LoginResponse");
const ReplaceCurrentPropValueWith = require("./modifiers/ReplaceCurrentPropValueWith");
const UsernameExistedError = require("./exceptions/UsernameExistedError");
const JwtFilter = require("./middlewares/JwtFilter");
const resolveFilter = require("./utils/resolveMongoFilter");
const RateLimit = require("./middlewares/RateLimit");
const isFalsy = require("./validations/isFalsy");
const MissingRequestBodyDataError = require("./exceptions/MissingRequestBodyDataError");
const NotAnArrayError = require("./exceptions/NotAnArrayError");
const SetProp = require("./dto/SetProp");
const isValidCttSisPassword = require("./validations/isValidCttSisPassword");
const isValidCttSisUsername = require("./validations/isValidCttSisUsername");
const InvalidCttSisUsernameError = require("./exceptions/InvalidCttSisUsernameError");
const InvalidCttSisPassswordError = require("./exceptions/InvalidCttSisPassswordError");
const isValidClassIds = require("./validations/isValidClassIds");
const InvalidClassIdsError = require("./exceptions/InvalidClassIdsError");
const LopDangKy = require("./entities/LopDangKy");
const isValidHocKy = require("./validations/isValidHocKy");
const InvalidHocKyError = require("./exceptions/InvalidHocKyError");
const toNormalizedString = require("./dto/toNormalizedString");

const app = express();
const server = http.createServer(app);
const emitter = new EventEmitter();

app.use(express.json());
app.use("/", express.static("./static", { maxAge: String(7 * 24 * 60 * 60 * 1000) /* 7 day */ }));
app.use("/examples", express.static("./examples"));
app.post("/api/test/jobs/new", SecretAuth(config.SECRET), (req, resp) => {
  try {
    emitter.emit(config.NEW_JOB, req.body);
    resp.send(req.body);
  } catch (err) {
    logger.error(err);
    resp.status(500).send(err);
  }
});

new mongodb.MongoClient(config.MONGODB_CONNECTION_STRING).connect().then((client) => {
  const db = client.db(config.DATABASE_NAME);
  app.post("/api/login", ExceptionHandlerWrapper(async (req, resp) => {
    const body = new LoginWithUsernamePasswordRequest(new ObjectModifer([
      PickProps(["username", "password"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
    ]).apply(req.body));
    const hashedPassword = crypto.createHash("sha256").update(body.password).digest("hex");
    const record = await db.collection(config.ACCOUNT_COLLECTION_NAME).findOne({ username: body.username, password: hashedPassword });
    const account = new Account(record).withId(record._id);
    const token = jwt.sign({ id: account._id }, config.SECRET, { expiresIn: "1h" });
    resp.send(new BaseResponse().ok(new LoginResponse(token)));
  }));
  app.post("/api/signup", ExceptionHandlerWrapper(async (req, resp) => {
    const body = new LoginWithUsernamePasswordRequest(new ObjectModifer([
      PickProps(["username", "password"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
      ReplaceCurrentPropValueWith("password", (oldValue) => crypto.createHash("sha256").update(oldValue).digest("hex")),
    ]).apply(req.body));
    const isUsernameExists = await db.collection(config.ACCOUNT_COLLECTION_NAME).findOne({ username: body.username });
    if (isUsernameExists) {
      throw new UsernameExistedError(body.username);
    }
    const account = new Account(body);
    await db.collection(config.ACCOUNT_COLLECTION_NAME).insertOne(account);
    resp.send(new BaseResponse().ok(account.toClient()));
  }));

  app.get("/api/accounts/current/dkhptd-s", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer([
      PickProps(["status", "timeToStart", "username"], { dropFalsy: true }),
    ]).apply(req.query);
    const accountId = req.__accountId;

    const filter = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new mongodb.ObjectId(accountId);
    const jobs = await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DangKyHocPhanTuDongJob(x).toClient())));
  }));
  app.get("/api/accounts/:otherAccountId/current/dkhptd-s", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer([
      PickProps(["status", "timeToStart", "username"], { dropFalsy: true }),
    ]).apply(req.query);
    // TODO: check privilege of account
    const filter = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new mongodb.ObjectId(req.params.otherAccountId);
    const jobs = await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DangKyHocPhanTuDongJob(x).toClient())));
  }));

  app.post("/api/accounts/current/dkhptd", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const data = req.body;
    if (!data) {
      throw new MissingRequestBodyDataError();
    }

    const ownerAccountId = new mongodb.ObjectId(req.__accountId);
    const safeData = new ObjectModifer([
      PickProps(["username", "password", "classIds", "timeToStart"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
      NormalizeArrayProp("classIds", "string", ""),
      NormalizeIntProp("timeToStart"),
      SetProp("createdAt", Date.now()),
      SetProp("status", JobStatus.READY),
      SetProp("ownerAccountId", ownerAccountId),
    ]).apply(data);

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

    const ownerAccountId = new mongodb.ObjectId(req.__accountId);
    const result = [];
    const jobsToInsert = [];

    for (const entry of data) {
      try {
        const safeEntry = new ObjectModifer([
          PickProps(["username", "password", "classIds", "timeToStart"]),
          NormalizeStringProp("username"),
          NormalizeStringProp("password"),
          NormalizeArrayProp("classIds", "string", ""),
          NormalizeIntProp("timeToStart"),
          SetProp("createdAt", Date.now()),
          SetProp("status", JobStatus.READY),
          SetProp("ownerAccountId", ownerAccountId),
        ]).apply(entry);

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
    const accountId = req.__accountId;
    const filter = { _id: new mongodb.ObjectId(req.params.jobId), ownerAccountId: new mongodb.ObjectId(accountId) };
    const record = await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).findOne(filter);
    const newJob = new DangKyHocPhanTuDongJob(record).toRetry();
    await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).insertOne(newJob);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));
  app.put("/api/accounts/current/dkhptd-s/:jobId/cancel", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = req.__accountId;
    const filter = { _id: new mongodb.ObjectId(req.params.jobId), ownerAccountId: new mongodb.ObjectId(accountId) };
    await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).findOneAndUpdate(filter, { $set: { status: JobStatus.CANCELED } });
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.delete("/api/accounts/current/dkhptd-s/:jobId", JwtFilter(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const accountId = req.__accountId;
    const filter = { _id: new mongodb.ObjectId(req.params.jobId), ownerAccountId: new mongodb.ObjectId(accountId) };
    await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).deleteOne(filter);
    resp.send(new BaseResponse().ok(req.params.jobId));
  }));

  app.post("/api/lop-dang-kys", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const data = req.body?.data;
    if (isFalsy(data)) {
      throw new MissingRequestBodyDataError();
    }

    if (!Array.isArray(data)) {
      throw new NotAnArrayError(data);
    }

    const lopDangKysToInsert = [];
    const result = [];
    for (const entry of data) {
      try {
        const lopDangKyConstruct = new ObjectModifer([
          PickProps([
            "MaLop",
            "MaLopKem",
            "MaHocPhan",
            "TenHocPhan",
            "LoaiLop",
            "BuoiHocSo",
            "HocVaoThu",
            "ThoiGianHoc",
            "PhongHoc",
            "HocVaoCacTuan",
            "GhiChu",
            "HocKy",
          ]),
          NormalizeIntProp("MaLop"),
          NormalizeIntProp("MaLopKem"),
          NormalizeStringProp("MaHocPhan"),
          NormalizeStringProp("TenHocPhan"),
          NormalizeStringProp("LoaiLop"),
          NormalizeIntProp("BuoiHocSo"),
          NormalizeIntProp("HocVaoThu"),
          NormalizeStringProp("ThoiGianHoc"),
          NormalizeStringProp("PhongHoc"),
          NormalizeStringProp("HocVaoCacTuan"),
          NormalizeStringProp("GhiChu"),
          NormalizeStringProp("HocKy"),
          SetProp("createdAt", Date.now()),
        ]).apply(entry);

        const lopDangKy = new LopDangKy(lopDangKyConstruct);

        if (!isValidHocKy(lopDangKy.HocKy)) {
          throw new InvalidHocKyError(lopDangKy.HocKy);
        }
        lopDangKysToInsert.push(lopDangKy);
        result.push(new BaseResponse().ok(lopDangKy));
      } catch (err) {
        if (err.__isSafeError) {
          result.push(err.toBaseResponse());
        } else {
          result.push(new BaseResponse().failed(err).withMessage(err.message));
        }
      }
    }

    await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).insertMany(lopDangKysToInsert);
    resp.send(new BaseResponse().ok(result));
  }));

  app.get("/api/lop-dang-kys", ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer([
      PickProps(["MaLop", "MaLopKem", "LoaiLop", "MaHocPhan", "TenHocPhan", "BuoiHocSo", "HocVaoThu", "ThoiGianHoc", "PhongHoc", "HocVaoCacTuan", "HocKy"], { dropFalsy: true }),
    ]).apply(req.query);
    const hocKy = toNormalizedString(query.HocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = resolveFilter(String(query.q).split(","));
    filter.HocKy = hocKy;
    const lopDangKys = await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(lopDangKys));
  }));
  app.get("/api/lop-dang-kys/:id", ExceptionHandlerWrapper(async (req, resp) => {
    const id = toNormalizedString(req.params.id);
    const filter = { _id: new mongodb.ObjectId(id) };
    const lopDangKy = await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).findOne(filter);
    resp.send(new BaseResponse().ok(lopDangKy));
  }));
  app.get("/api/lop-dang-kys/ma-lops", ExceptionHandlerWrapper(async (req, resp) => {
    const maLops = toNormalizedString(req.query.maLops).split(",").map((x) => toNormalizedString(x));
    const hocKy = toNormalizedString(req.query.hocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = { MaLop: { $in: maLops }, HocKy: hocKy };
    const lopDangKys = await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(lopDangKys));
  }));
  app.get("/api/lop-dang-kys/ma-lops/start-withs", ExceptionHandlerWrapper(async (req, resp) => {
    const maLops = toNormalizedString(req.query.maLops).split(",").map((x) => toNormalizedString(x));
    const hocKy = toNormalizedString(req.query.hocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = {
      MaLop: {
        $or: maLops.map((maLop) => {
          const missing = 6 - String(maLop).length;
          if (missing === 0) {
            return { MaLop: maLop };
          }
          const delta = 10 ** missing;
          return { MaLop: { $gte: maLop * delta, $lte: maLop * delta + delta } };
        }),
      },
      HocKy: hocKy,
    };
    const lopDangKys = await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).find(filter).toArray();
    resp.send(new BaseResponse().ok(lopDangKys));
  }));
  app.get("/api/lop-dang-kys/ma-lops/:maLop", ExceptionHandlerWrapper(async (req, resp) => {
    const maLop = toNormalizedString(req.params.maLop);
    const hocKy = toNormalizedString(req.query.hocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = { MaLop: maLop, HocKy: hocKy };
    const lopDangKy = await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).findOne(filter);
    resp.send(new BaseResponse().ok(lopDangKy));
  }));

  app.delete("/api/lop-dang-kys", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer([
      PickProps(["MaLop", "MaLopKem", "LoaiLop", "MaHocPhan", "TenHocPhan", "BuoiHocSo", "HocVaoThu", "ThoiGianHoc", "PhongHoc", "HocVaoCacTuan", "HocKy"], { dropFalsy: true }),
    ]).apply(req.query);
    const hocKy = toNormalizedString(query.HocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = resolveFilter(String(query.q).split(","));
    filter.HocKy = hocKy;
    const deleteResult = await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).deleteMany(filter);
    resp.send(new BaseResponse().ok(deleteResult.deletedCount));
  }));
  app.delete("/api/lop-dang-kys", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const query = new ObjectModifer([
      PickProps(["MaLop", "MaLopKem", "LoaiLop", "MaHocPhan", "TenHocPhan", "BuoiHocSo", "HocVaoThu", "ThoiGianHoc", "PhongHoc", "HocVaoCacTuan", "HocKy"], { dropFalsy: true }),
    ]).apply(req.query);
    const hocKy = toNormalizedString(query.HocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = resolveFilter(String(query.q).split(","));
    filter.HocKy = hocKy;
    const deleteResult = await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).deleteMany(filter);
    resp.send(new BaseResponse().ok(deleteResult.deletedCount));
  }));
  app.delete("/api/duplicate-lop-dang-kys", SecretAuth(config.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
    const cursor = db.collection(config.LOP_DANG_KY_COLLECTION_NAME).find();
    const ids = new Set();
    const delimiter = "::";
    let deletedCount = 0;

    while (await cursor.hasNext()) {
      const lopDangKy = await cursor.next();
      const { MaLop, BuoiHocSo, HocKy } = lopDangKy;
      ids.add([HocKy, MaLop, BuoiHocSo].join(delimiter));
    }

    for (const id of ids) {
      const [HocKy, MaLop, BuoiHocSo] = id.split(delimiter);
      const lopDangKyMoiNhat = await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).findOne({ MaLop, BuoiHocSo, HocKy }).sort({ createdAt: -1 });
      const lopDangKyMoiNhatCreatedAt = lopDangKyMoiNhat.createdAt;
      const deleteResult = await db.collection(config.LOP_DANG_KY_COLLECTION_NAME).deleteMany({ MaLop, BuoiHocSo, HocKy, createdAt: { $ne: lopDangKyMoiNhatCreatedAt } });
      deletedCount += deleteResult.deletedCount;
    }

    resp.send(new BaseResponse().ok(deletedCount));
  }));

  emitter.on(config.JOB_RESULT, async (result) => logger.info(result));
  emitter.on(config.JOB_RESULT, async (result) => db.collection(config.JOB_RESULT_COLLECTION_NAME).insertOne(result));

  loop.infinity(async () => {
    try {
      const cursor = db.collection(config.DKHPTD_JOB_COLLECTION_NAME).find({
        timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
        status: JobStatus.READY,
      }, { sort: { timeToStart: 1 } });
      while (await cursor.hasNext()) {
        const entry = await cursor.next();
        const job = new DangKyHocPhanTuDongJob(entry);
        emitter.emit(config.NEW_JOB, {
          name: "DangKyHocPhanTuDong",
          params: {
            username: job.username,
            password: job.password,
            classIds: job.classIds,
          },
        });
        await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).updateOne({ _id: new mongodb.ObjectId(job._id) }, {
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

amqp.connect(config.RABBITMQ_CONNECTION_STRING, (error0, connection) => {
  if (error0) {
    logger.error(error0);
    return;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      logger.error(error1);
      return;
    }
    emitter.on(config.NEW_JOB, (job) => channel.sendToQueue(config.NEW_JOB, toBuffer(job)));

    channel.assertQueue(config.NEW_JOB);
    channel.assertExchange(config.WORKER_FEEDBACK, "topic", { durable: false });

    // result queue
    channel.assertQueue(config.JOB_RESULT, null, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.consume(q.queue, async (msg) => {
        try {
          const result = JSON.parse(msg.content.toString());
          emitter.emit(config.JOB_RESULT, result);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    // ping queue
    channel.assertQueue(`${config.APP_ID}.${config.PING}`, { exclusive: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.bindQueue(q.queue, config.WORKER_FEEDBACK, config.PING);
      channel.consume(q.queue, async (msg) => {
        try {
          const ping = JSON.parse(msg.content.toString());
          emitter.emit(config.PING, ping);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });

    // TODO: doing queue
    channel.assertQueue(`${config.APP_ID}.${config.DOING}`, { exclusive: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      channel.bindQueue(q.queue, config.WORKER_FEEDBACK, config.DOING);
      channel.consume(q.queue, async (msg) => {
        try {
          const doing = JSON.parse(msg.content.toString());
          emitter.emit(config.DOING, doing);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });
  });
});

emitter.on(config.DOING, (doing) => logger.info(`Doing: ${toJson(doing)}`));
emitter.on(config.PING, (ping) => logger.info(`Ping: ${toJson(ping, null)}`));

logger.info(`Config: \n${toKeyValueString(config)}`);
server.listen(config.PORT, config.BIND);
