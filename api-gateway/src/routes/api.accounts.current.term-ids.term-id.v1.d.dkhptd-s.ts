import { Filter, ObjectId } from "mongodb";
import express from "express";
import { cfg, CollectionName } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { DKHPTDJobV1 } from "src/entities";
import { resolveMongoFilter } from "src/merin";
import { ExceptionWrapper, InjectTermId, JwtFilter } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { modify, m } from "src/modifiers";
import { decryptJobV1 } from "src/dto";

export const router = express.Router();

router.get("/api/accounts/current/term-ids/:termId/v1/d/dkhptd-s", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.termId = termId;

  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .find(filter)
    .toArray();

  const data = jobs.map((x) => decryptJobV1(new DKHPTDJobV1(x)));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/api/accounts/current/term-ids/:termId/v1/d/dkhptd-s/:jobId", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId) };
  filter.ownerAccountId = new ObjectId(accountId);
  filter.termId = termId;
  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV1)
    .findOne(filter);
  const job = new DKHPTDJobV1(doc);
  resp.send(new BaseResponse().ok(decryptJobV1(job)));
}));
