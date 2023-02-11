import express from "express";
import { ObjectId } from "mongodb";
import { cfg } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { AccountPreference } from "app/entities";
import { MissingRequestBodyDataError } from "app/exceptions";
import { ExceptionWrapper } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";
import { modify, PickProps, NormalizeArrayProp, SetProp } from "app/modifiers";
import { isFalsy } from "app/utils";

const router = express.Router();

router.post("/preference", ExceptionWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const data = req.body;
  const termId = req.__termId;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = modify(data, [
    PickProps(["wantedSubjectIds"]),
    NormalizeArrayProp("wantedSubjectIds", "string"),
    SetProp("ownerAccountId", new ObjectId(accountId)),
  ]);

  const newPreference = new AccountPreference(body);
  newPreference.termId = termId;

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .insertOne(newPreference);

  resp.send(new BaseResponse().ok());
}));

export default router;
