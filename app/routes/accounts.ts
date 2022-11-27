import express from "express";
import { Filter, ObjectId } from "mongodb";

import cfg from "../cfg";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import Account from "../entities/Account";
import AccountNotFoundError from "../exceptions/AccountNotFoundError";
import JwtFilter from "../middlewares/JwtFilter";
import NormalizeStringProp from "../modifiers/NormalizeStringProp";
import ObjectModifer from "../modifiers/ObjectModifier";
import PickProps from "../modifiers/PickProps";
import ReplaceCurrentPropValueWith from "../modifiers/ReplaceCurrentPropValueWith";
import BaseResponse from "../payloads/BaseResponse";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";
import toSHA256 from "../utils/toSHA256";
import isFalsy from "../validations/isFalsy";

const router = express.Router();

router.get("/api/accounts/current", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<Account> = { _id: new ObjectId(accountId) };
  const account = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne(filter);

  if (isFalsy(account)) throw new AccountNotFoundError(accountId);

  resp.send(new BaseResponse().ok(new Account(account).toClient()));
}));
router.put("/api/accounts/current/password", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const body = new ObjectModifer(req.body)
    .modify(PickProps(["password"]))
    .modify(NormalizeStringProp("password"))
    .modify(ReplaceCurrentPropValueWith("password", (oldValue) => toSHA256(oldValue)))
    .collect();

  const newHashedPassword = body.password;

  const filter: Filter<Account> = { _id: new ObjectId(accountId) };

  const account = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne(filter);

  if (isFalsy(account)) throw new AccountNotFoundError(accountId);

  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .updateOne(filter, { $set: { password: newHashedPassword } });

  resp.send(new BaseResponse().ok(new Account(account).toClient()));
}));

export default router;
