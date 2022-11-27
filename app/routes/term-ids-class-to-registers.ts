import epxress from "express";
import { Filter, ObjectId } from "mongodb";
import cfg from "../cfg";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import ClassToRegister from "../entities/ClassToRegister";
import SecretFilter from "../middlewares/SecretFilter";
import ObjectModifer from "../modifiers/ObjectModifier";
import PickProps from "../modifiers/PickProps";
import BaseResponse from "../payloads/BaseResponse";
import requireValidTermId from "../requires/requireValidTermId";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";
import resolveMongoFilter from "../utils/resolveMongoFilter";
import toNormalizedString from "../utils/toNormalizedString";
import toSafeInt from "../utils/toSafeInt";

const router = epxress.Router();

router.get("/api/term-ids/:termId/class-to-registers", ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const termId = toNormalizedString(req.params.termId);

  requireValidTermId("termId", termId);

  const filter: Filter<ClassToRegister> = resolveMongoFilter(String(query.q).split(","));
  filter.termId = termId;
  const classToRegisters = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/api/term-ids/:termId/class-to-registers/:id", ExceptionHandlerWrapper(async (req, resp) => {
  const id = toNormalizedString(req.params.id);
  const termId = toNormalizedString(req.params.termId);
  const filter: Filter<ClassToRegister> = { _id: new ObjectId(id) };
  filter.termId = termId;
  const classToRegister = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

router.delete("/api/term-ids/:termId/class-to-registers/class-ids/:classId/duplicates", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const classId = toSafeInt(req.params.classId);
  const termId = toNormalizedString(req.params.termId);

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
