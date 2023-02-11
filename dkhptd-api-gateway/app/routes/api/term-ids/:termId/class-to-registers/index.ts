import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { ExceptionWrapper, IsAdminFilter, JwtFilter } from "app/middlewares";
import { modify, NormalizeIntProp, PickProps } from "app/modifiers";
import BaseResponse from "app/payloads/BaseResponse";
import { toSafeInt, toNormalizedString } from "app/utils";
import { resolveMongoFilter } from "app/merin";
import { ClassToRegister } from "app/entities";

const router = express.Router();

router.get("", ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [
    PickProps(["q", "page", "size"], { dropFalsy: true }),
    NormalizeIntProp("page"),
    NormalizeIntProp("size"),
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
    .collection(ClassToRegister.name)
    .find(filter)
    .skip(page * size)
    .limit(size)
    .toArray();
  resp.send(new BaseResponse().ok(classToRegisters));
}));

router.get("/:id", ExceptionWrapper(async (req, resp) => {
  const id = toNormalizedString(req.params.id);
  const termId = req.__termId;
  const filter: Filter<ClassToRegister> = { _id: new ObjectId(id) };
  filter.termId = termId;
  const classToRegister = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(ClassToRegister.name)
    .findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

router.delete("/class-ids/:classId/duplicates", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const classId = toSafeInt(req.params.classId);
  const termId = req.__termId;

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