import { Filter, ObjectId } from "mongodb";
import express from "express";
import { cfg } from "../../../../../../cfg";
import { mongoConnectionPool } from "../../../../../../connections";
import DKHPTDJobV1 from "../../../../../../entities/DKHPTDJobV1";
import ExceptionHandlerWrapper from "../../../../../../middlewares/ExceptionHandlerWrapper";
import { PickProps, modify } from "../../../../../../modifiers";
import BaseResponse from "../../../../../../payloads/BaseResponse";
import { resolveMongoFilter } from "../../../../../../merin";

const router = express.Router();

router.get("/", ExceptionHandlerWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);

  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => new DKHPTDJobV1(x).decrypt().toClient());
  resp.send(new BaseResponse().ok(data));
}));

router.get("/:jobId", ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1> = { _id: new ObjectId(req.params.jobId) };
  filter.ownerAccountId = new ObjectId(accountId);
  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV1.name)
    .findOne(filter);
  const job = new DKHPTDJobV1(doc);
  resp.send(new BaseResponse().ok(job.decrypt().toClient()));
}));

export default router;
