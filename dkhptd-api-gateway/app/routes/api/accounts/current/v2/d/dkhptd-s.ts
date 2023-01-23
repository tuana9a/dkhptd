import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg } from "../../../../../../cfg";
import { mongoConnectionPool } from "../../../../../../connections";
import ExceptionHandlerWrapper from "../../../../../../middlewares/ExceptionHandlerWrapper";
import { decryptJobV2, modify, PickProps } from "../../../../../../utils";
import BaseResponse from "../../../../../../payloads/BaseResponse";
import { resolveMongoFilter } from "../../../../../../merin";
import { DKHPTDJobV2 } from "../../../../../../entities";

const router = express.Router();

router.get("/d/dkhptd-s", ExceptionHandlerWrapper(async (req, resp) => {
  const query = modify(req.query, [PickProps(["q"], { dropFalsy: true })]);
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV2> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  const jobs = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(DKHPTDJobV2.name)
    .find(filter)
    .toArray();
  const data = jobs.map((x) => decryptJobV2(new DKHPTDJobV2(x)));
  resp.send(new BaseResponse().ok(data));
}));

export default router;
