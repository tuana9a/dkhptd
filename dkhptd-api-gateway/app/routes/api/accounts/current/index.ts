import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg } from "../../../../cfg";
import { mongoConnectionPool } from "../../../../connections";
import { ExceptionWrapper } from "../../../../middlewares";
import BaseResponse from "../../../../payloads/BaseResponse";
import { accountToClient, toSHA256 } from "../../../../utils";
import { JwtFilter } from "../../../../middlewares";
import { isFalsy } from "../../../../utils";
import { MissingRequestBodyDataError, UsernameNotFoundError } from "../../../../exceptions";
import { Account, AccountPreference } from "../../../../entities";
import { modify, PickProps, NormalizeStringProp, ReplaceCurrentPropValueWith, NormalizeArrayProp, SetProp } from "../../../../modifiers";

const router = express.Router();

router.use(JwtFilter(cfg.SECRET));

router.get("", ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<Account> = { _id: new ObjectId(accountId) };
  const account = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .findOne(filter);

  if (isFalsy(account)) throw new UsernameNotFoundError(accountId);

  resp.send(new BaseResponse().ok(accountToClient(new Account(account))));
}));

router.put("/password", ExceptionWrapper(async (req, resp) => {
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
    .collection(Account.name)
    .findOne(filter);

  if (isFalsy(account)) throw new UsernameNotFoundError(accountId);

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(Account.name)
    .updateOne(filter, { $set: { password: newHashedPassword } });

  resp.send(new BaseResponse().ok(accountToClient(new Account(account))));
}));

router.get("/preferences", ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<AccountPreference> = {
    ownerAccountId: new ObjectId(accountId),
  };
  const preferences = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(preferences));
}));

router.put("/preferences/:preferenceId", ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const preferenceId = new ObjectId(req.params.preferenceId);

  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = modify(data, [
    PickProps(["termId", "wantedSubjectIds"]),
    NormalizeStringProp("termId"),
    NormalizeArrayProp("wantedSubjectIds", "string"),
  ]);

  const filter: Filter<AccountPreference> = {
    _id: preferenceId,
    ownerAccountId: new ObjectId(accountId),
  };
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .updateOne(filter, {
      $set: {
        termId: body.termId,
        wantedSubjectIds: body.wantedSubjectIds,
      },
    });
  resp.send(new BaseResponse().ok());
}));

router.post("/preference", ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = modify(data, [
    PickProps(["termId", "wantedSubjectIds"]),
    NormalizeStringProp("termId"),
    NormalizeArrayProp("wantedSubjectIds", "string"),
    SetProp("ownerAccountId", new ObjectId(accountId)),
  ]);

  const newPreference = new AccountPreference(body);
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .insertOne(newPreference);
  resp.send(new BaseResponse().ok());
}));

export default router;