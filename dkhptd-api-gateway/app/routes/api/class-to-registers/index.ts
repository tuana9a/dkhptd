import express from "express";
import { Filter } from "mongodb";
import multer from "multer";
import { tkbBus } from "../../../bus";
import { cfg } from "../../../cfg";
import { mongoConnectionPool } from "../../../connections";
import ExceptionHandlerWrapper from "../../../middlewares/ExceptionHandlerWrapper";
import SecretFilter from "../../../middlewares/SecretFilter";
import { modify, PickProps, NormalizeIntProp, NormalizeStringProp, SetProp } from "../../../utils";
import BaseResponse from "../../../payloads/BaseResponse";
import { toNormalizedString, toSafeInt } from "../../../utils";
import { resolveMongoFilter } from "../../../merin";
import { FaslyValueError, NotAnArrayError } from "../../../exceptions";
import { isFalsy } from "../../../utils";
import { tkbEvent } from "../../../app-event";
import { ClassToRegister } from "../../../entities";

const router = express.Router();

router.post("/", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body?.data;

  if (isFalsy(data)) throw new FaslyValueError("body.data");
  if (!Array.isArray(data)) throw new NotAnArrayError("body.data");

  const classToRegistersToInsert = [];
  const result = [];
  for (const entry of data) {
    try {
      const classToRegisterConstruct = modify(entry, [
        PickProps([
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
        NormalizeIntProp("classId"),
        NormalizeIntProp("secondClassId"),
        NormalizeStringProp("subjectId"),
        NormalizeStringProp("subjectName"),
        NormalizeStringProp("classType"),
        NormalizeIntProp("learnDayNumber"),
        NormalizeIntProp("learnAtDayOfWeek"),
        NormalizeStringProp("learnTime"),
        NormalizeStringProp("learnRoom"),
        NormalizeStringProp("learnWeek"),
        NormalizeStringProp("describe"),
        NormalizeStringProp("termId"),
        SetProp("createdAt", Date.now()),
      ]);

      const classToRegister = new ClassToRegister(classToRegisterConstruct);

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

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .insertMany(classToRegistersToInsert);
  resp.send(new BaseResponse().ok(result));
}));

router.post("/file", SecretFilter(cfg.SECRET), multer({ limits: { fileSize: 5 * 1000 * 1000 /* 5mb */ } }).single("file"), ExceptionHandlerWrapper(async (req, resp) => {
  const file = req.file;
  tkbBus.emit(tkbEvent.TKB_XLSX_UPLOADED, file.buffer);
  resp.send(new BaseResponse().ok());
}));

router.get("/", ExceptionHandlerWrapper(async (req, resp) => {
  const query = modify(req.query, [
    PickProps(["q", "page", "size"], { dropFalsy: true }),
    NormalizeIntProp("page"),
    NormalizeIntProp("size"),
  ]);

  const page = query.page || 0;
  const size = query.size || 10;

  const filter: Filter<ClassToRegister> = query.q
    ? resolveMongoFilter(query.q.split(","))
    : {};

  const classToRegisters = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .find(filter)
    .skip(page * size)
    .limit(size)
    .toArray();
  const data = classToRegisters.map((x) => new ClassToRegister(x));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/class-ids", ExceptionHandlerWrapper(async (req, resp) => {
  const classIds = toNormalizedString(req.query.classIds)
    .split(",")
    .map((x) => toSafeInt(x));
  const termId = toSafeInt(req.query.termId);

  const filter: Filter<ClassToRegister> = { classId: { $in: classIds }, termId: termId };
  const classToRegisters = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/class-ids/start-withs", ExceptionHandlerWrapper(async (req, resp) => {
  const classIds = toNormalizedString(req.query.classIds)
    .split(",")
    .map((x) => toNormalizedString(x));
  const termId = toSafeInt(req.query.termId);

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
    .collection(ClassToRegister.name)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/class-ids/:classId", ExceptionHandlerWrapper(async (req, resp) => {
  const classId = toSafeInt(req.params.classId);
  const termId = toSafeInt(req.query.termId);

  const filter: Filter<ClassToRegister> = { classId: classId, termId: termId };
  const classToRegister = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

router.delete("/", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const filter: Filter<ClassToRegister> = resolveMongoFilter(
    String(query.q).split(",")
  );
  const deleteResult = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .deleteMany(filter);
  resp.send(new BaseResponse().ok(deleteResult.deletedCount));
}));

export default router;