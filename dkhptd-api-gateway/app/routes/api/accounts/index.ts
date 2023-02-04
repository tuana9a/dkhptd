import express from "express";
import { ObjectId } from "mongodb";
import { cfg } from "../../../cfg";
import { mongoConnectionPool } from "../../../connections";
import { Account } from "../../../entities";
import { ExceptionWrapper } from "../../../middlewares";
import { IsAdminFilter } from "../../../middlewares";
import { JwtFilter } from "../../../middlewares";
import BaseResponse from "../../../payloads/BaseResponse";

const router = express.Router();

router.put("/:otherAccountId/role", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const body = req.body;
  const otherAccountId = new ObjectId(req.params.otherAccountId);
  await mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(Account.name).updateOne({ _id: new ObjectId(otherAccountId) }, { $set: { role: body.role } });
  return resp.send(new BaseResponse().ok({}));
}));

export default router;