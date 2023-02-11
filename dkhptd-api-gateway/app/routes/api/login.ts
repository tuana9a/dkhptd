import express from "express";
import { cfg } from "app/cfg";
import jwt from "jsonwebtoken";
import { mongoConnectionPool } from "../../connections";
import { UsernameNotFoundError, WrongPasswordError } from "../../exceptions";
import { ExceptionWrapper } from "../../middlewares";
import { modify, PickProps, NormalizeStringProp } from "../../modifiers";
import BaseResponse from "../../payloads/BaseResponse";
import LoginWithUsernamePasswordRequest from "../../payloads/LoginWithUsernamePasswordRequest";
import { toSHA256 } from "../../utils";
import { Account } from "../../entities";

const router = express.Router();

router.post("", ExceptionWrapper(async (req, resp) => {
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

export default router;
