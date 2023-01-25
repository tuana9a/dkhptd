import express from "express";
import { Filter, ObjectId } from "mongodb";
import { cfg } from "../../../../../../cfg";
import { mongoConnectionPool } from "../../../../../../connections";
import { AccountPreference } from "../../../../../../entities";
import { MissingRequestBodyDataError } from "../../../../../../exceptions";
import ExceptionHandlerWrapper from "../../../../../../middlewares/ExceptionHandlerWrapper";
import BaseResponse from "../../../../../../payloads/BaseResponse";
import { isFalsy, modify, PickProps, NormalizeArrayProp } from "../../../../../../utils";

const router = express.Router();

router.get("", ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const termId = req.__termId;

  const filter: Filter<AccountPreference> = {
    ownerAccountId: new ObjectId(accountId),
    termId: termId,
  };

  const preferences = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(preferences));
}));

router.put("/:preferenceId", ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const preferenceId = new ObjectId(req.params.preferenceId);
  const termId = req.__termId;

  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = modify(data, [
    PickProps(["wantedSubjectIds"]),
    NormalizeArrayProp("wantedSubjectIds", "string"),
  ]);

  const filter: Filter<AccountPreference> = {
    _id: preferenceId,
    ownerAccountId: new ObjectId(accountId),
    termId: termId,
  };

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .updateOne(filter, {
      $set: {
        termId: termId,
        wantedSubjectIds: body.wantedSubjectIds,
      },
    });
  resp.send(new BaseResponse().ok());
}));

export default router;
