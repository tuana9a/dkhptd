import express from "express";
import { ObjectId } from "mongodb";
import { cfg, CollectionName } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { ExceptionWrapper } from "src/middlewares";
import { IsAdminFilter } from "src/middlewares";
import { JwtFilter } from "src/middlewares";
import { BaseResponse } from "src/payloads";

const router = express.Router();

router.put("/api/accounts/:otherAccountId/role", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const body = req.body;
  const otherAccountId = new ObjectId(req.params.otherAccountId);
  await mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(CollectionName.ACCOUNT).updateOne({ _id: new ObjectId(otherAccountId) }, { $set: { role: body.role } });
  return resp.send(new BaseResponse().ok({}));
}));

export default router;
