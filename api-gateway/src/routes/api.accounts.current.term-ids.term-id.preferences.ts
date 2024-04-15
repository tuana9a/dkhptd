import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg, CollectionName } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { AccountPreference } from "src/entities";
import { MissingRequestBodyDataError } from "src/exceptions";
import { ExceptionWrapper, InjectTermId, JwtFilter } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { modify, m } from "src/modifiers";
import { isFalsy } from "src/utils";

export const router = express.Router();

router.get("/api/accounts/current/term-ids/:termId/preferences", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<AccountPreference> = {
    ownerAccountId: new ObjectId(accountId),
    termId: termId,
  };

  const preferences = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.PREFERENCE)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(preferences));
}));

router.put("/api/accounts/current/term-ids/:termId/preferences/:preferenceId", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const preferenceId = new ObjectId(req.params.preferenceId);
  const termId = req.__termId;

  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = modify(data, [
    m.pick(["wantedSubjectIds"]),
    m.normalizeArray("wantedSubjectIds", "string"),
  ]);

  const filter: Filter<AccountPreference> = {
    _id: preferenceId,
    ownerAccountId: new ObjectId(accountId),
    termId: termId,
  };

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.PREFERENCE)
    .updateOne(filter, {
      $set: {
        termId: termId,
        wantedSubjectIds: body.wantedSubjectIds,
      },
    });
  resp.send(new BaseResponse().ok());
}));
