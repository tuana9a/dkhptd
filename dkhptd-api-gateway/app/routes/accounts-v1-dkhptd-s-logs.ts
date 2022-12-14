import express from "express";
import { Filter, ObjectId } from "mongodb";
import cfg from "../cfg";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import DKHPTDJobV1Logs from "../entities/DKHPTDJobV1Logs";
import JwtFilter from "../middlewares/JwtFilter";
import ObjectModifer from "../modifiers/ObjectModifier";
import PickProps from "../modifiers/PickProps";
import BaseResponse from "../payloads/BaseResponse";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";
import resolveMongoFilter from "../utils/resolveMongoFilter";

const router = express.Router();

router.get("/api/accounts/current/v1/dkhptd-s/:jobId/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1Logs> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1Logs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV1Logs(x).toClient())));
}));

router.get("/api/accounts/current/v1/dkhptd-s/:jobId/d/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const query = new ObjectModifer(req.query).modify(PickProps(["q"], { dropFalsy: true })).collect();
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobV1Logs> = query.q ? resolveMongoFilter(query.q.split(",")) : {};
  filter.ownerAccountId = new ObjectId(accountId);
  filter.jobId = new ObjectId(req.params.jobId);
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobV1Logs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobV1Logs(x).decrypt().toClient())));
}));

export default router;