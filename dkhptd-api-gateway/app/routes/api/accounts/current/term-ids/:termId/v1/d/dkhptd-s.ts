import { Filter, ObjectId } from "mongodb";
import express from "express";
import { cfg } from "../../../../../../../../cfg";
import { mongoConnectionPool } from "../../../../../../../../connections";
import { DKHPTDJobV1 } from "../../../../../../../../entities";
import { resolveMongoFilter } from "../../../../../../../../merin";
import { ExceptionWrapper } from "../../../../../../../../middlewares";
import BaseResponse from "../../../../../../../../payloads/BaseResponse";
import { modify, PickProps } from "../../../../../../../../modifiers";
import { decryptJobV1 } from "../../../../../../../../utils";

const router = express.Router();

router.get("/", ExceptionWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.termId = termId;

  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .find(filter)
    .toArray();

  const data = jobs.map((x) => decryptJobV1(new DKHPTDJobV1(x)));
  resp.send(new BaseResponse().ok(data));
}));

router.get("/:jobId", ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId) };
  filter.ownerAccountId = new ObjectId(accountId);
  filter.termId = termId;
  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .findOne(filter);
  const job = new DKHPTDJobV1(doc);
  resp.send(new BaseResponse().ok(decryptJobV1(job)));
}));

export default router;