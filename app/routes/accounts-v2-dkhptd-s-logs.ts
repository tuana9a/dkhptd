import express from "express";
import { Filter, ObjectId } from "mongodb";
import cfg from "../cfg";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import DKHPTDJobV2Logs from "../entities/DKHPTDJobV2Logs";
import JwtFilter from "../middlewares/JwtFilter";
import ObjectModifer from "../modifiers/ObjectModifier";
import PickProps from "../modifiers/PickProps";
import BaseResponse from "../payloads/BaseResponse";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";
import getRequestAccountId from "../utils/getRequestAccountId";
import resolveMongoFilter from "../utils/resolveMongoFilter";

const router = express.Router();

router.get("/api/accounts/current/v2/dkhptd-s/:jobId/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = getRequestAccountId(req);

  const filter: Filter<DKHPTDJobV2Logs> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2Logs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV2Logs(x).toClient())));
}));

router.get("/api/accounts/current/v2/dkhptd-s/:jobId/d/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = getRequestAccountId(req);

  const filter: Filter<DKHPTDJobV2Logs> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2Logs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV2Logs(x).decrypt().toClient())));
}));

export default router;
