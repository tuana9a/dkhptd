import express from "express";
import { cfg } from "app/cfg";
import jwt from "jsonwebtoken";
import { mongoConnectionPool } from "app/connections";
import { UsernameNotFoundError, WrongPasswordError } from "app/exceptions";
import { ExceptionWrapper } from "app/middlewares";
import { modify, PickProps, NormalizeStringProp } from "app/modifiers";
import BaseResponse from "app/payloads/BaseResponse";
import LoginWithUsernamePasswordRequest from "app/payloads/LoginWithUsernamePasswordRequest";
import { toSHA256 } from "app/utils";
import { Account } from "app/entities";

export const router = express.Router();

router.post("/api/login", ExceptionWrapper(async (req, resp) => {
  const body = new LoginWithUsernamePasswordRequest(
    modify(req.body, [
      PickProps(["username", "password"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
    ])
  );

  const hashedPassword = toSHA256(body.password);

  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne({ username: body.username });

  if (!doc) throw new UsernameNotFoundError();

  const account = new Account(doc);

  if (account.password != hashedPassword) {
    throw new WrongPasswordError();
  }

  const token = jwt.sign({ id: account._id }, cfg.SECRET, {
    expiresIn: "1d",
  });
  resp.send(new BaseResponse().ok({ token, username: account.username, role: account.role }));
}));
