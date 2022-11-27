import express from "express";
import jwt from "jsonwebtoken";

import Account from "../entities/Account";
import cfg from "../cfg";
import AccountNotFoundError from "../exceptions/AccountNotFoundError";
import UsernameExistedError from "../exceptions/UsernameExistedError";
import NormalizeStringProp from "../modifiers/NormalizeStringProp";
import ObjectModifer from "../modifiers/ObjectModifier";
import PickProps from "../modifiers/PickProps";
import ReplaceCurrentPropValueWith from "../modifiers/ReplaceCurrentPropValueWith";
import BaseResponse from "../payloads/BaseResponse";
import LoginResponse from "../payloads/LoginResponse";
import LoginWithUsernamePasswordRequest from "../payloads/LoginWithUsernamePasswordRequest";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";
import toSHA256 from "../utils/toSHA256";
import mongoConnectionPool from "../connections/MongoConnectionPool";

const router = express.Router();

router.post("/api/login", ExceptionHandlerWrapper(async (req, resp) => {
  const body = new LoginWithUsernamePasswordRequest(new ObjectModifer(req.body)
    .modify(PickProps(["username", "password"]))
    .modify(NormalizeStringProp("username"))
    .modify(NormalizeStringProp("password"))
    .collect());

  const hashedPassword = toSHA256(body.password);

  const account = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne({ username: body.username, password: hashedPassword });

  if (!account) throw new AccountNotFoundError();

  const token = jwt.sign({ id: account._id }, cfg.SECRET, { expiresIn: "1h" });
  resp.send(new BaseResponse().ok(new LoginResponse(token)));
}));

router.post("/api/signup", ExceptionHandlerWrapper(async (req, resp) => {
  const body = new LoginWithUsernamePasswordRequest(new ObjectModifer(req.body)
    .modify(PickProps(["username", "password"]))
    .modify(NormalizeStringProp("username"))
    .modify(NormalizeStringProp("password"))
    .modify(ReplaceCurrentPropValueWith("password", (oldValue) => toSHA256(oldValue)))
    .collect());

  const isUsernameExists = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne({ username: body.username });

  if (isUsernameExists) {
    throw new UsernameExistedError(body.username);
  }

  const account = new Account(body);

  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .insertOne(account);

  resp.send(new BaseResponse().ok(account.toClient()));
}));

export default router;
