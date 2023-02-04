import express from "express";
import { cfg } from "../../cfg";
import { mongoConnectionPool } from "../../connections";
import { Account } from "../../entities";
import { FaslyValueError, UsernameExistedError } from "../../exceptions";
import { ExceptionWrapper } from "../../middlewares";
import { accountToClient, isFalsy } from "../../utils";
import { modify, PickProps, NormalizeStringProp, ReplaceCurrentPropValueWith } from "../../modifiers";
import BaseResponse from "../../payloads/BaseResponse";
import LoginWithUsernamePasswordRequest from "../../payloads/LoginWithUsernamePasswordRequest";
import { toSHA256 } from "../../utils";

const router = express.Router();

router.post("", ExceptionWrapper(async (req, resp) => {
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

export default router;
