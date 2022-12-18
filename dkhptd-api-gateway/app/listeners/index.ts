import { ObjectId } from "mongodb";
import crypto from "crypto";

import bus from "../bus";
import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import JobStatus from "../configs/JobStatus";
import QueueName from "../configs/QueueName";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import rabbitmqConnectionPool from "../connections/RabbitMQConnectionPool";
import ClassToRegister from "../entities/ClassToRegister";
import DKHPTDJob from "../entities/DKHPTDJob";
import DKHPTDJobLogs from "../entities/DKHPTDJobLogs";
import DKHPTDJobV1 from "../entities/DKHPTDJobV1";
import DKHPTDJobV1Logs from "../entities/DKHPTDJobV1Logs";
import DKHPTDJobV2 from "../entities/DKHPTDJobV2";
import DKHPTDJobV2Logs from "../entities/DKHPTDJobV2Logs";
import logger from "../loggers/logger";
import NormalizeIntProp from "../modifiers/NormalizeIntProp";
import NormalizeStringProp from "../modifiers/NormalizeStringProp";
import ObjectModifer from "../modifiers/ObjectModifier";
import SetProp from "../modifiers/SetProp";
import ParsedClassToRegister from "../payloads/ParsedClassToRegister";
import { c } from "../utils/cypher";
import toBuffer from "../utils/toBuffer";
import toJson from "../utils/toJson";

export default {
  setup() {
    bus.on(AppEvent.TKB_XLSX_PARSED, async (result: { data: ParsedClassToRegister[] }) => {
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
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).insertMany(classes);
      } catch (err) {
        logger.error(err);
      }
    });
    bus.on(AppEvent.TKB_XLSX_UPLOADED, (buffer: Buffer) => {
      logger.info("new Parse XLSX Job");
      rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.PARSE_TKB_XLSX, buffer);
    });
    bus.on(AppEvent.NEW_JOB_RESULT, async (result) => {
      try {
        logger.info(`Received job result: ${result.id}`);
        const jobId = new ObjectId(result.id);
        const job = await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).findOne({ _id: jobId });

        if (!job) {
          logger.warn(`Job ${result.id} not found for job result`);
          return;
        }

        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });
        const logs = new DKHPTDJobLogs({
          jobId,
          workerId: result.workerId,
          ownerAccountId: job.ownerAccountId,
          logs: result.logs,
          createdAt: Date.now(),
        });
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobLogs.name).insertOne(logs);
      } catch (err) {
        logger.error(err);
      }
    });
    bus.on(AppEvent.NEW_JOB_V1_RESULT, async (result) => {
      try {
        logger.info(`Received job v1 result: ${result.id}`);
        const jobId = new ObjectId(result.id);
        const job = await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).findOne({ _id: jobId });

        if (!job) {
          logger.warn(`Job ${result.id} not found for job result`);
          return;
        }
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });
        const newIv = crypto.randomBytes(16).toString("hex");
        const logs = new DKHPTDJobV1Logs({
          jobId,
          workerId: result.workerId,
          ownerAccountId: job.ownerAccountId,
          logs: c(cfg.JOB_ENCRYPTION_KEY).e(toJson(result.logs), newIv),
          createdAt: Date.now(),
          iv: newIv,
        });
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1Logs.name).insertOne(logs);
      } catch (err) {
        logger.error(err);
      }
    });
    bus.on(AppEvent.NEW_JOB_V2_RESULT, async (result) => {
      try {
        logger.info(`Received job v2 result: ${result.id}`);
        const jobId = new ObjectId(result.id);
        const job = await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).findOne({ _id: jobId });

        if (!job) {
          logger.warn(`Job ${result.id} not found for job result`);
          return;
        }
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });
        const newIv = crypto.randomBytes(16).toString("hex");
        const logs = new DKHPTDJobV2Logs({
          jobId,
          workerId: result.workerId,
          ownerAccountId: job.ownerAccountId,
          logs: c(cfg.JOB_ENCRYPTION_KEY).e(toJson(result.logs), newIv),
          createdAt: Date.now(),
          iv: newIv,
        });
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2Logs.name).insertOne(logs);
      } catch (err) {
        logger.error(err);
      }
    });
    bus.on(AppEvent.WORKER_DOING, (doing) => logger.info(`Doing: ${toJson(doing)}`));
    bus.on(AppEvent.WORKER_PING, (ping) => logger.info(`Ping: ${toJson(ping)}`));
    bus.on(AppEvent.NEW_JOB, (job) => logger.info("new Job: " + toJson(job)));
    bus.on(AppEvent.NEW_JOB, (job) => rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.RUN_JOB, toBuffer(toJson(job))));
    bus.on(AppEvent.NEW_JOB_V1, (job) => logger.info("new Job V1: " + toJson(job)));
    bus.on(AppEvent.NEW_JOB_V1, (job) => {
      const iv = crypto.randomBytes(16).toString("hex");
      rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.RUN_JOB_V1, toBuffer(c(cfg.AMQP_ENCRYPTION_KEY).e(toJson(job), iv)), {
        headers: {
          iv: iv,
        }
      });
    });
  }
};