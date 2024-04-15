import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg, CollectionName } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { ExceptionWrapper, JwtFilter } from "src/middlewares";
import { decryptJobV2 } from "src/dto";
import { modify, m } from "src/modifiers";
import { BaseResponse } from "src/payloads";
import { resolveMongoFilter } from "src/merin";
import { DKHPTDJobV2 } from "src/entities";

export const router = express.Router();

router.get("/api/accounts/current/v2/d/dkhptd-s", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [m.pick(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.DKHPTDV2)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => decryptJobV2(new DKHPTDJobV2(x)));
  resp.send(new BaseResponse().ok(data));
}));
