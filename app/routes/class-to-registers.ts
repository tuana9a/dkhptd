import express from "express";
import { Filter } from "mongodb";
import multer from "multer";
import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import ClassToRegister from "../entities/ClassToRegister";
import emitter from "../listeners/emiter";
import SecretFilter from "../middlewares/SecretFilter";
import NormalizeIntProp from "../modifiers/NormalizeIntProp";
import NormalizeStringProp from "../modifiers/NormalizeStringProp";
import ObjectModifer from "../modifiers/ObjectModifier";
import PickProps from "../modifiers/PickProps";
import SetProp from "../modifiers/SetProp";
import BaseResponse from "../payloads/BaseResponse";
import requireArray from "../requires/requireArray";
import requireNotFalsy from "../requires/requireNotFalsy";
import requireValidTermId from "../requires/requireValidTermId";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";
import resolveMongoFilter from "../utils/resolveMongoFilter";
import toNormalizedString from "../utils/toNormalizedString";
import toSafeInt from "../utils/toSafeInt";

const router = express.Router();

router.post("/api/class-to-registers", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body?.data;

  requireNotFalsy("body.data", data);
  requireArray("body.data", data);

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

      requireValidTermId("classToRegister.termId", classToRegister.termId);

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
  emitter.emit(AppEvent.TKB_XLSX_UPLOADED, file.buffer);
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

  requireValidTermId("termId", termId);

  const filter = { classId: { $in: classIds }, termId: termId };
  const classToRegisters = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/api/class-to-registers/class-ids/start-withs", ExceptionHandlerWrapper(async (req, resp) => {
  const classIds = toNormalizedString(req.query.classIds).split(",").map((x) => toNormalizedString(x));
  const termId = toNormalizedString(req.query.termId);

  requireValidTermId("termId", termId);

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

  requireValidTermId("termId", termId);

  const filter = { classId: classId, termId: termId };
  const classToRegister = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

export default router;