import express from "express";
import { Filter, ObjectId } from "mongodb";
import multer from "multer";
import { cfg, CollectionName, QueueName } from "src/cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "src/connections";
import { ExceptionWrapper, ClassRegisterFileUploaderFilter, InjectTermId, IsAdminFilter, JwtFilter } from "src/middlewares";
import { modify, m } from "src/modifiers";
import { BaseResponse } from "src/payloads";
import { toBuffer, toNormalizedString, toSafeInt } from "src/utils";
import { resolveMongoFilter } from "src/merin";
import { FaslyValueError, NotAnArrayError } from "src/exceptions";
import { isFalsy } from "src/utils";
import { ClassToRegister } from "src/entities";
import logger from "src/loggers/logger";

const router = express.Router();

router.post("/api/class-to-registers", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const data = req.body?.data;

  if (isFalsy(data)) throw new FaslyValueError("body.data");
  if (!Array.isArray(data)) throw new NotAnArrayError("body.data");

  const classToRegistersToInsert = [];
  const result = [];
  for (const entry of data) {
    try {
      const classToRegisterConstruct = modify(entry, [
        m.pick([
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
        ]),
        m.normalizeInt("classId"),
        m.normalizeInt("secondClassId"),
        m.normalizeString("subjectId"),
        m.normalizeString("subjectName"),
        m.normalizeString("classType"),
        m.normalizeInt("learnDayNumber"),
        m.normalizeInt("learnAtDayOfWeek"),
        m.normalizeString("learnTime"),
        m.normalizeString("learnRoom"),
        m.normalizeString("learnWeek"),
        m.normalizeString("describe"),
        m.normalizeString("termId"),
        m.set("createdAt", Date.now()),
      ]);

      const classToRegister = new ClassToRegister(classToRegisterConstruct);

      classToRegistersToInsert.push(classToRegister);
      result.push(new BaseResponse().ok(classToRegister));
    } catch (err) {
      if (err.__isSafeError) {
        result.push(err.toBaseResponse());
      } else {
        result.push(new BaseResponse().failed(err).m(err.message));
      }
    }
  }

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .insertMany(classToRegistersToInsert);
  resp.send(new BaseResponse().ok(result));
}));

router.post("/api/class-to-registers/file", JwtFilter(cfg.SECRET), ClassRegisterFileUploaderFilter(), multer({ limits: { fileSize: 5 * 1000 * 1000 /* 5mb */ } }).single("file"), ExceptionWrapper(async (req, resp) => {
  const file = req.file;
  logger.info(`Received uploaded TKB xlsx length ${file.buffer.length}`);
  rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.PARSE_TKB_XLSX, toBuffer(file.buffer));
  resp.send(new BaseResponse().ok());
}));

router.get("/api/class-to-registers", ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [
    m.pick(["q", "page", "size"], { dropFalsy: true }),
    m.normalizeInt("page"),
    m.normalizeInt("size"),
  ]);

  const page = query.page || 0;
  const size = query.size || 10;

  const filter: Filter<ClassToRegister> = query.q
    ? resolveMongoFilter(query.q.split(","))
    : {};

  const docs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .find(filter)
    .skip(page * size)
    .limit(size)
    .toArray();
  const data = docs.map((x) => new ClassToRegister(x));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/api/class-to-registers/class-ids", ExceptionWrapper(async (req, resp) => {
  const classIds = toNormalizedString(req.query.classIds)
    .split(",")
    .map((x) => toSafeInt(x));
  const termId = toNormalizedString(req.query.termId);

  const filter: Filter<ClassToRegister> = { classId: { $in: classIds }, termId: termId };
  const classToRegisters = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/api/class-to-registers/class-ids/start-withs", ExceptionWrapper(async (req, resp) => {
  const classIds = toNormalizedString(req.query.classIds)
    .split(",")
    .map((x) => toNormalizedString(x));
  const termId = toNormalizedString(req.query.termId);

  const filter: Filter<ClassToRegister> = {
    classId: {
      $or: classIds
        .map((x) => toSafeInt(x))
        .map((classId) => {
          const missing = 6 - String(classId).length;
          if (missing === 0) {
            return { classId: classId };
          }
          const delta = 10 ** missing;
          return {
            classId: { $gte: classId * delta, $lte: classId * delta + delta },
          };
        }),
    },
    termId: termId,
  };
  const classToRegisters = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/api/class-to-registers/class-ids/:classId", ExceptionWrapper(async (req, resp) => {
  const classId = toSafeInt(req.params.classId);
  const termId = toNormalizedString(req.query.termId);

  const filter: Filter<ClassToRegister> = { classId: classId, termId: termId };
  const classToRegister = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

router.delete("/api/class-to-registers", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const filter: Filter<ClassToRegister> = resolveMongoFilter(
    String(query.q).split(",")
  );
  const deleteResult = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .deleteMany(filter);
  resp.send(new BaseResponse().ok(deleteResult.deletedCount));
}));

router.get("/api/term-ids/:termId/class-to-registers", InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [
    m.pick(["q", "page", "size"], { dropFalsy: true }),
    m.normalizeInt("page"),
    m.normalizeInt("size"),
  ]);
  const termId = req.__termId;

  const filter: Filter<ClassToRegister> = resolveMongoFilter(
    String(query.q).split(",")
  );

  filter.termId = termId;

  const page = query.page || 0;
  const size = query.size || 10;

  const classToRegisters = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .find(filter)
    .skip(page * size)
    .limit(size)
    .toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/api/term-ids/:termId/class-to-registers/:id", InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const id = toNormalizedString(req.params.id);
  const termId = req.__termId;
  const filter: Filter<ClassToRegister> = { _id: new ObjectId(id), termId: termId };
  const classToRegister = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

router.get("/api/term-ids/:termId/class-to-registers/class-ids/:classId", InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const classId = toSafeInt(req.params.classId);
  const termId = req.__termId;
  const filter: Filter<ClassToRegister> = { classId: classId, termId: termId };
  const classToRegister = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

export default router;
