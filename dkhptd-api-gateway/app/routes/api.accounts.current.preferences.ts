/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg, CollectionName } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { ExceptionWrapper } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";
import { JwtFilter } from "app/middlewares";
import { isFalsy } from "app/utils";
import { MissingRequestBodyDataError } from "app/exceptions";
import { AccountPreference } from "app/entities";
import { modify, PickProps, NormalizeStringProp, NormalizeArrayProp, SetProp } from "app/modifiers";

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
    PickProps(["termId", "wantedSubjectIds"]),
    NormalizeStringProp("termId"),
    NormalizeArrayProp("wantedSubjectIds", "string"),
    SetProp("ownerAccountId", new ObjectId(accountId)),
  ]);

  const newPreference = new AccountPreference(body);
  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.PREFERENCE)
    .insertOne(newPreference);
  resp.send(new BaseResponse().ok());
}));