/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { ObjectId } from "mongodb";
import { cfg } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { TermId } from "app/entities";
import { FaslyValueError, NotAnArrayError } from "app/exceptions";
import { ExceptionWrapper, IsAdminFilter, JwtFilter } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";
import { isFalsy } from "app/utils";

const router = express.Router();

router.get("", ExceptionWrapper(async (req, resp) => {
  const termIds = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(TermId.name)
    .find()
    .toArray();
  resp.send(new BaseResponse().ok(termIds.map(x => new TermId(x))));
}));

router.post("", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const data = req.body.data;
  if (isFalsy(data)) throw new FaslyValueError("body.data");
  if (!Array.isArray(data)) throw new NotAnArrayError("body.data");
  const termIds = data.map(x => x.name).map(x => new TermId({ name: x }));
  await mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(TermId.name).insertMany(termIds);
  resp.send(new BaseResponse().ok(termIds));
}));

router.delete("/duplicates", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const docs = await mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(TermId.name).find().toArray();
  const termIds = docs.map(x => new TermId(x));
  const toBeDeletedIds: ObjectId[] = [];
  const set = new Set<string>();
  for (const termId of termIds) {
    if (set.has(termId.name)) {
      toBeDeletedIds.push(termId._id);
    } else {
      set.add(termId.name);
    }
  }
  await mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(TermId.name).deleteMany({ _id: { $in: toBeDeletedIds } });
  resp.send(new BaseResponse().ok(toBeDeletedIds));
}));

export default router;