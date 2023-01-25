import express from "express";
import { ObjectId } from "mongodb";
import { cfg } from "../../../../../../cfg";
import { mongoConnectionPool } from "../../../../../../connections";
import { AccountPreference } from "../../../../../../entities";
import { MissingRequestBodyDataError } from "../../../../../../exceptions";
import ExceptionHandlerWrapper from "../../../../../../middlewares/ExceptionHandlerWrapper";
import BaseResponse from "../../../../../../payloads/BaseResponse";
import { isFalsy, modify, PickProps, NormalizeArrayProp, SetProp } from "../../../../../../utils";

const router = express.Router();

router.post("/preference", ExceptionHandlerWrapper(async (req, resp) => {
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
