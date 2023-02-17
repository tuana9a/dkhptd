/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { ObjectId, Filter } from "mongodb";
import { cfg, CollectionName } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { TermId } from "app/entities";
import { FaslyValueError, NotAnArrayError } from "app/exceptions";
import { ExceptionWrapper, InjectTermId, IsAdminFilter, JwtFilter } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";
import { isFalsy } from "app/utils";
import { modify, NormalizeIntProp, PickProps } from "app/modifiers";
import { toSafeInt, toNormalizedString } from "app/utils";
import { resolveMongoFilter } from "app/merin";
import { ClassToRegister } from "app/entities";

export const router = express.Router();

router.get("/api/term-ids", ExceptionWrapper(async (req, resp) => {
  const doc = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.TERM_ID)
    .findOne();
  resp.send(new BaseResponse().ok(new TermId(doc).termIds));
}));

router.post("/api/term-ids", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const data = req.body.data;
  if (isFalsy(data)) throw new FaslyValueError("body.data");
  if (!Array.isArray(data)) throw new NotAnArrayError("body.data");
  const termIds = Array.from(new Set(data.map(x => toNormalizedString(x)))).sort(((a, b) => a.localeCompare(b)));
  const doc = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.TERM_ID)
    .findOne();
  const termId = new TermId(doc);
  termId.addAll(termIds);
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.TERM_ID)
    .updateOne({}, { $set: { ...new TermId({ termIds: termIds }) } }, { upsert: true });
  resp.send(new BaseResponse().ok(termIds));
}));

router.get("/api/term-ids/:termId/class-to-registers", InjectTermId(), ExceptionWrapper(async (req, resp) => {
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
  const filter: Filter<ClassToRegister> = { _id: new ObjectId(id) };
  filter.termId = termId;
  const classToRegister = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
    .findOne(filter);
  resp.send(new BaseResponse().ok(classToRegister));
}));

router.delete("/api/term-ids/:termId/class-to-registers/class-ids/:classId/duplicates", JwtFilter(cfg.SECRET), IsAdminFilter(), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const classId = toSafeInt(req.params.classId);
  const termId = req.__termId;

  const filter: Filter<ClassToRegister> = {
    classId: classId,
    termId: termId,
  };

  const cursor = mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.CTR)
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
    .collection(CollectionName.CTR)
    .deleteMany(deleteFilter);

  resp.send(new BaseResponse().ok(deleteResult.deletedCount));
}));
