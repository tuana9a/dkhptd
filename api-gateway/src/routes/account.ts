import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg, CollectionName } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { ExceptionWrapper } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { toSHA256 } from "src/utils";
import { JwtFilter } from "src/middlewares";
import { isFalsy } from "src/utils";
import { AccountNotFoundError } from "src/exceptions";
import { Account } from "src/entities";
import { modify, m } from "src/modifiers";
import { dropPassword } from "src/dto";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/accounts/current", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<Account> = { _id: new ObjectId(accountId) };
  const account = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .findOne(filter);

  if (isFalsy(account)) throw new AccountNotFoundError(accountId);

  resp.send(new BaseResponse().ok(dropPassword(new Account(account))));
}));

router.put("/api/accounts/current/password", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const body = modify(req.body, [
    m.pick(["password"]),
    m.normalizeString("password"),
    m.replace("password", (oldValue) => toSHA256(oldValue)),
  ]);

  const newHashedPassword = body.password;

  const filter: Filter<Account> = { _id: new ObjectId(accountId) };

  const account = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .findOne(filter);

  if (isFalsy(account)) throw new AccountNotFoundError(accountId);

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .updateOne(filter, { $set: { password: newHashedPassword } });

  resp.send(new BaseResponse().ok(dropPassword(new Account(account))));
}));

router.get("/api/accounts/current/renew-token", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .findOne({ _id: new ObjectId(req.__accountId) });

  if (!doc) throw new AccountNotFoundError(req.__accountId);

  const account = new Account(doc);

  const token = jwt.sign({ id: account._id }, cfg.SECRET, {
    expiresIn: "1d",
  });
  resp.send(new BaseResponse().ok({ token, username: account.username, role: account.role }));
}));

export default router;
