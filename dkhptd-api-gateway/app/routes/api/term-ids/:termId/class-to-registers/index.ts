import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg } from "../../../../../cfg";
import { mongoConnectionPool } from "../../../../../connections";
import ExceptionHandlerWrapper from "../../../../../middlewares/ExceptionHandlerWrapper";
import SecretFilter from "../../../../../middlewares/SecretFilter";
import { modify, PickProps } from "../../../../../utils";
import BaseResponse from "../../../../../payloads/BaseResponse";
import { toSafeInt, toNormalizedString, toSafeString } from "../../../../../utils";
import { resolveMongoFilter } from "../../../../../merin";
import { isValidTermId } from "../../../../../utils";
import { InvalidTermIdError } from "../../../../../exceptions";
import { ClassToRegister } from "../../../../../entities";

const router = express.Router();

router.get("", ExceptionHandlerWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const termId = toSafeString(req.__termId);

  if (!isValidTermId(termId)) throw new InvalidTermIdError(termId);

  const filter: Filter<ClassToRegister> = resolveMongoFilter(
    String(query.q).split(",")
  );
  filter.termId = termId;
  const classToRegisters = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/:id", ExceptionHandlerWrapper(async (req, resp) => {
  const id = toNormalizedString(req.params.id);
  const termId = toSafeString(req.__termId);
  const filter: Filter<ClassToRegister> = { _id: new ObjectId(id) };
  filter.termId = termId;
  const classToRegister = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

router.delete("/class-ids/:classId/duplicates", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const classId = toSafeInt(req.params.classId);
  const termId = toSafeString(req.__termId);

  const filter: Filter<ClassToRegister> = {
    classId: classId,
    termId: termId,
  };
  const cursor = mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .find(filter);
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

  const deleteFilter: Filter<ClassToRegister> = {
    _id: { $in: Array.from(deleteIds) },
  };
  const deleteResult = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .deleteMany(deleteFilter);

  resp.send(new BaseResponse().ok(deleteResult.deletedCount));
}));

export default router;