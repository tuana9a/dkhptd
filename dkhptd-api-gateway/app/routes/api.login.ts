import express from "express";
import { cfg, CollectionName } from "app/cfg";
import jwt from "jsonwebtoken";
import { mongoConnectionPool } from "app/connections";
import { AccountNotFoundError, WrongPasswordError } from "app/exceptions";
import { ExceptionWrapper } from "app/middlewares";
import { modify, m } from "app/modifiers";
import BaseResponse from "app/payloads/BaseResponse";
import LoginWithUsernamePasswordRequest from "app/payloads/LoginWithUsernamePasswordRequest";
import { toSHA256 } from "app/utils";
import { Account } from "app/entities";

export const router = express.Router();

router.post("/api/login", ExceptionWrapper(async (req, resp) => {
  const body = new LoginWithUsernamePasswordRequest(
    modify(req.body, [
      m.pick(["username", "password"]),
      m.normalizeString("username"),
      m.normalizeString("password"),
    ])
  );

  const hashedPassword = toSHA256(body.password);

  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .findOne({ username: body.username });

  if (!doc) throw new AccountNotFoundError();

  const account = new Account(doc);

  if (account.password != hashedPassword) {
    throw new WrongPasswordError();
  }

  const token = jwt.sign({ id: account._id }, cfg.SECRET, {
    expiresIn: "1d",
  });
  resp.send(new BaseResponse().ok({ token, username: account.username, role: account.role }));
}));
