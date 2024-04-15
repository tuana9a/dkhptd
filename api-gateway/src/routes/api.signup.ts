import express from "express";
import { cfg, CollectionName } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { Account } from "src/entities";
import { FaslyValueError, UsernameExistedError } from "src/exceptions";
import { ExceptionWrapper } from "src/middlewares";
import { isFalsy } from "src/utils";
import { modify, m } from "src/modifiers";
import { BaseResponse, LoginWithUsernamePasswordRequest } from "src/payloads";
import { toSHA256 } from "src/utils";
import { dropPassword } from "src/dto";

export const router = express.Router();

router.post("/api/signup", ExceptionWrapper(async (req, resp) => {
  const body = new LoginWithUsernamePasswordRequest(
    modify(req.body, [
      m.pick(["username", "password"]),
      m.normalizeString("username"),
      m.normalizeString("password"),
      m.replace("password", (oldValue) =>
        toSHA256(oldValue)
      ),
    ])
  );

  if (isFalsy(body.username)) throw new FaslyValueError("body.username");
  if (isFalsy(body.password)) throw new FaslyValueError("body.password");

  const isUsernameExists = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .findOne({ username: body.username });

  if (isUsernameExists) {
    throw new UsernameExistedError(body.username);
  }

  const account = new Account(body);

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .insertOne(account);

  resp.send(new BaseResponse().ok(dropPassword(account)));
}));
