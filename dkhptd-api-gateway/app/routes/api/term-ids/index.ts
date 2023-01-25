/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { ObjectId } from "mongodb";
import { cfg } from "../../../cfg";
import { mongoConnectionPool } from "../../../connections";
import { TermId } from "../../../entities";
import { FaslyValueError, NotAnArrayError } from "../../../exceptions";
import ExceptionHandlerWrapper from "../../../middlewares/ExceptionHandlerWrapper";
import SecretFilter from "../../../middlewares/SecretFilter";
import BaseResponse from "../../../payloads/BaseResponse";
import { isFalsy } from "../../../utils";

const router = express.Router();

router.get("", ExceptionHandlerWrapper(async (req, resp) => {
  const termIds = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(TermId.name)
    .find()
    .toArray();
  resp.send(new BaseResponse().ok(termIds.map(x => new TermId(x))));
}));

router.post("", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const data = req.body.data;
  if (isFalsy(data)) throw new FaslyValueError("body.data");
  if (!Array.isArray(data)) throw new NotAnArrayError("body.data");
  const termIds = data.map(x => x.name).map(x => new TermId({ name: x }));
  await mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(TermId.name).insertMany(termIds);
  resp.send(new BaseResponse().ok(termIds));
}));

router.delete("/duplicates", SecretFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
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