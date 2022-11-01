const http = require("http");
const express = require("express");
const amqp = require("amqplib/callback_api");
const mongodb = require("mongodb");
const EventEmitter = require("events");

const toJson = require("./dto/toJson");
const toBuffer = require("./dto/toBuffer");
const SecretAuth = require("./middlewares/SecretAuth");
const DeleteDangKyHocPhanTuDongJob = require("./routes/DeleteDangKyHocPhanTuDongJob");
const NewDangKyHocPhanTuDongJob = require("./routes/NewDangKyHocPhanTuDongJob");
const FindDangKyHocPhanTuDongJobs = require("./routes/FindDangKyHocPhanTuDongJobs");
const config = require("./config");
const loop = require("./utils/loop");
const JobStatus = require("./entities/JobStatus");
const DangKyHocPhanTuDongJob = require("./entities/DangKyHocPhanTuDongJob");
const logger = require("./loggers/logger");
const LoginAndSignup = require("./routes/LoginAndSignup");
const toKeyValueString = require("./dto/toKeyValueString");

const app = express();
const server = http.createServer(app);
const appEvent = new EventEmitter();

app.use(express.json());
app.use("/", express.static("./static", { maxAge: String(7 * 24 * 60 * 60 * 1000) /* 7 day */ }));
app.use("/examples", express.static("./examples"));
app.post("/api/test/jobs/new", SecretAuth(config.SECRET), (req, resp) => {
  try {
    appEvent.emit(config.NEW_JOB, req.body);
    resp.send(req.body);
  } catch (err) {
    logger.error(err);
    resp.status(500).send(err);
  }
});

new mongodb.MongoClient(config.MONGODB_CONNECTION_STRING).connect().then((client) => {
  const db = client.db(config.DATABASE_NAME);
  app.use(FindDangKyHocPhanTuDongJobs(db, config.DKHPTD_JOB_COLLECTION_NAME));
  app.use(NewDangKyHocPhanTuDongJob(db, config.DKHPTD_JOB_COLLECTION_NAME));
  app.use(DeleteDangKyHocPhanTuDongJob(db, config.DKHPTD_JOB_COLLECTION_NAME));
  app.use(LoginAndSignup(db, config.ACCOUNT_COLLECTION_NAME));

  appEvent.on(config.JOB_RESULT, async (result) => logger.info(result));
  appEvent.on(config.JOB_RESULT, async (result) => db.collection(config.JOB_RESULT_COLLECTION_NAME).insertOne(result));

  loop.infinity(async () => {
    try {
      const cursor = db.collection(config.DKHPTD_JOB_COLLECTION_NAME).find({
        timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
        status: JobStatus.READY,
      }, { sort: { timeToStart: 1 } });
      while (await cursor.hasNext()) {
        const entry = await cursor.next();
        const job = new DangKyHocPhanTuDongJob(entry);
        appEvent.emit(config.NEW_JOB, {
          name: "DangKyHocPhanTuDong",
          params: {
            username: job.username,
            password: job.password,
            classIds: job.classIds,
          },
        });
        await db.collection(config.DKHPTD_JOB_COLLECTION_NAME).updateOne({ _id: new mongodb.ObjectId(job._id) }, { $set: { status: JobStatus.DOING } });
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
    appEvent.on(config.NEW_JOB, (job) => channel.sendToQueue(config.NEW_JOB, toBuffer(job)));

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
          appEvent.emit(config.JOB_RESULT, result);
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
          appEvent.emit(config.PING, ping);
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
          appEvent.emit(config.DOING, doing);
        } catch (err) {
          logger.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });
  });
});

appEvent.on(config.DOING, (doing) => logger.info(`Doing: ${toJson(doing)}`));
appEvent.on(config.PING, (ping) => logger.info(`Ping: ${toJson(ping, null)}`));

logger.info(toKeyValueString(config));
server.listen(config.PORT, config.BIND);
