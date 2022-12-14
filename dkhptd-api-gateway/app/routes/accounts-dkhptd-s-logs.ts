import express from "express";
import { Filter, ObjectId } from "mongodb";
import cfg from "../cfg";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import DKHPTDJobLogs from "../entities/DKHPTDJobLogs";
import JwtFilter from "../middlewares/JwtFilter";
import BaseResponse from "../payloads/BaseResponse";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";

const router = express.Router();

router.get("/api/accounts/current/dkhptd-s/:jobId/logs", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<DKHPTDJobLogs> = {
    ownerAccountId: new ObjectId(accountId),
    jobId: new ObjectId(req.params.jobId),
  };
  const logs = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME).collection(DKHPTDJobLogs.name).find(filter).toArray();
  resp.send(new BaseResponse().ok(logs.map((x) => new DKHPTDJobLogs(x).toClient())));
}));

export default router;
