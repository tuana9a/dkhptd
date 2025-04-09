/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { cfg, CollectionName } from "src/cfg";
import { ExceptionWrapper } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { mongoConnectionPool } from "src/connections";
import { Subject } from "src/entities";
import { resolveMongoFilter } from "src/merin";
import { modify, m } from "src/modifiers";
import { Filter } from "mongodb";

const router = express.Router();

router.get("/api/subjects", ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [
    m.pick(["q", "page", "size"], { dropFalsy: true }),
    m.normalizeInt("page"),
    m.normalizeInt("size"),
  ]);

  const filter: Filter<Subject> = resolveMongoFilter(
    String(query.q).split(",")
  );

  const page = query.page || 0;
  const size = query.size || 10;

  const docs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.SUBJECT)
    .find(filter)
    .skip(page * size)
    .limit(size)
    .toArray();
  resp.send(new BaseResponse().ok(docs));
}));

router.get("/api/subjects/subject-ids/:subjectId", ExceptionWrapper(async (req, resp) => {
  const filter: Filter<Subject> = { subjectId: req.params.subjectId };
  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.SUBJECT)
    .findOne(filter);
  resp.send(new BaseResponse().ok(doc));
}));

export default router;
