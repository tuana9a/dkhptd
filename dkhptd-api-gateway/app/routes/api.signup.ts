import express from "express";
import { cfg } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { Account } from "app/entities";
import { FaslyValueError, UsernameExistedError } from "app/exceptions";
import { ExceptionWrapper } from "app/middlewares";
import { accountToClient, isFalsy } from "app/utils";
import { modify, PickProps, NormalizeStringProp, ReplaceCurrentPropValueWith } from "app/modifiers";
import BaseResponse from "app/payloads/BaseResponse";
import LoginWithUsernamePasswordRequest from "app/payloads/LoginWithUsernamePasswordRequest";
import { toSHA256 } from "app/utils";

export const router = express.Router();

router.post("/api/signup", ExceptionWrapper(async (req, resp) => {
  const body = new LoginWithUsernamePasswordRequest(
    modify(req.body, [
      PickProps(["username", "password"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
      ReplaceCurrentPropValueWith("password", (oldValue) =>
        toSHA256(oldValue)
      ),
    ])
  );

  if (isFalsy(body.username)) throw new FaslyValueError("body.username");
  if (isFalsy(body.password)) throw new FaslyValueError("body.password");

  const isUsernameExists = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne({ username: body.username });

  if (isUsernameExists) {
    throw new UsernameExistedError(body.username);
  }

  const account = new Account(body);

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .insertOne(account);

  resp.send(new BaseResponse().ok(accountToClient(account)));
}));
