import express from "express";
import { cfg } from "../../cfg";
import { mongoConnectionPool } from "../../connections";
import Account from "../../entities/Account";
import { UsernameExistedError } from "../../exceptions";
import ExceptionHandlerWrapper from "../../middlewares/ExceptionHandlerWrapper";
import { modify, PickProps, NormalizeStringProp, ReplaceCurrentPropValueWith } from "../../modifiers";
import BaseResponse from "../../payloads/BaseResponse";
import LoginWithUsernamePasswordRequest from "../../payloads/LoginWithUsernamePasswordRequest";
import { toSHA256 } from "../../to";

const router = express.Router();

router.post("", ExceptionHandlerWrapper(async (req, resp) => {
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

  resp.send(new BaseResponse().ok(account.toClient()));
}));

export default router;
