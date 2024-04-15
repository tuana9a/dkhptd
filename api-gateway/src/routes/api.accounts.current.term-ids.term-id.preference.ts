import express from "express";
import { ObjectId } from "mongodb";
import { cfg, CollectionName } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { AccountPreference } from "src/entities";
import { MissingRequestBodyDataError } from "src/exceptions";
import { ExceptionWrapper, InjectTermId, JwtFilter } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { modify, m } from "src/modifiers";
import { isFalsy } from "src/utils";

export const router = express.Router();

router.post("/api/accounts/current/term-ids/:termId/preference", JwtFilter(cfg.SECRET), InjectTermId(), ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const data = req.body;
  const termId = req.__termId;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = modify(data, [
    m.pick(["wantedSubjectIds"]),
    m.normalizeArray("wantedSubjectIds", "string"),
    m.set("ownerAccountId", new ObjectId(accountId)),
  ]);

  const newPreference = new AccountPreference(body);
  newPreference.termId = termId;

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.PREFERENCE)
    .insertOne(newPreference);

  resp.send(new BaseResponse().ok());
}));
