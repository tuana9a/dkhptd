/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg, CollectionName } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { ExceptionWrapper } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { JwtFilter } from "src/middlewares";
import { isFalsy } from "src/utils";
import { MissingRequestBodyDataError } from "src/exceptions";
import { AccountPreference } from "src/entities";
import { modify, m } from "src/modifiers";

export const router = express.Router();

router.get("/api/accounts/current/preferences", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const filter: Filter<AccountPreference> = {
    ownerAccountId: new ObjectId(accountId),
  };
  const preferences = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.PREFERENCE)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(preferences));
}));

router.put("/api/accounts/current/preferences/:preferenceId", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const preferenceId = new ObjectId(req.params.preferenceId);

  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = modify(data, [
    m.pick(["termId", "wantedSubjectIds"]),
    m.normalizeString("termId"),
    m.normalizeArray("wantedSubjectIds", "string"),
  ]);

  const filter: Filter<AccountPreference> = {
    _id: preferenceId,
    ownerAccountId: new ObjectId(accountId),
  };
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.PREFERENCE)
    .updateOne(filter, {
      $set: {
        termId: body.termId,
        wantedSubjectIds: body.wantedSubjectIds,
      },
    });
  resp.send(new BaseResponse().ok());
}));

router.post("/api/accounts/current/preference", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = modify(data, [
    m.pick(["termId", "wantedSubjectIds"]),
    m.normalizeString("termId"),
    m.normalizeArray("wantedSubjectIds", "string"),
    m.set("ownerAccountId", new ObjectId(accountId)),
  ]);

  const newPreference = new AccountPreference(body);
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.PREFERENCE)
    .insertOne(newPreference);
  resp.send(new BaseResponse().ok());
}));

router.delete("/api/accounts/current/preferences/:preferenceId", JwtFilter(cfg.SECRET), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const preferenceId = new ObjectId(req.params.preferenceId);

  const filter: Filter<AccountPreference> = {
    _id: preferenceId,
    ownerAccountId: new ObjectId(accountId),
  };
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.PREFERENCE)
    .deleteMany(filter);
  resp.send(new BaseResponse().ok());
}));
