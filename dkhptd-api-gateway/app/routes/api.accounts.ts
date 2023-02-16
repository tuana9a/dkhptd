import express from "express";
import { ObjectId } from "mongodb";
import { cfg } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { Account } from "app/entities";
import { ExceptionWrapper } from "app/middlewares";
import { IsAdminFilter } from "app/middlewares";
import { JwtFilter } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";

export const router = express.Router();

router.put("/api/accounts/:otherAccountId/role", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const body = req.body;
  const otherAccountId = new ObjectId(req.params.otherAccountId);
  await mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(Account.name).updateOne({ _id: new ObjectId(otherAccountId) }, { $set: { role: body.role } });
  return resp.send(new BaseResponse().ok({}));
}));
