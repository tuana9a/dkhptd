import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg, CollectionName } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { ExceptionWrapper } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";
import { toSHA256 } from "app/utils";
import { JwtFilter } from "app/middlewares";
import { isFalsy } from "app/utils";
import { UsernameNotFoundError } from "app/exceptions";
import { Account } from "app/entities";
import { modify, PickProps, NormalizeStringProp, ReplaceCurrentPropValueWith } from "app/modifiers";
import { dropPassword } from "app/dto";

export const router = express.Router();

router.get("/api/accounts/current", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<Account> = { _id: new ObjectId(accountId) };
  const account = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .findOne(filter);

  if (isFalsy(account)) throw new UsernameNotFoundError(accountId);

  resp.send(new BaseResponse().ok(dropPassword(new Account(account))));
}));

router.put("/api/accounts/current/password", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const body = modify(req.body, [
    PickProps(["password"]),
    NormalizeStringProp("password"),
    ReplaceCurrentPropValueWith("password", (oldValue) => toSHA256(oldValue)),
  ]);

  const newHashedPassword = body.password;

  const filter: Filter<Account> = { _id: new ObjectId(accountId) };

  const account = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .findOne(filter);

  if (isFalsy(account)) throw new UsernameNotFoundError(accountId);

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .updateOne(filter, { $set: { password: newHashedPassword } });

  resp.send(new BaseResponse().ok(dropPassword(new Account(account))));
}));
