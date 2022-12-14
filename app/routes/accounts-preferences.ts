import express from "express";
import { Filter, ObjectId } from "mongodb";
import cfg from "../cfg";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import AccountPreference from "../entities/AccountPreference";
import DKHPTDJobV1Logs from "../entities/DKHPTDJobV1Logs";
import MissingRequestBodyDataError from "../exceptions/MissingRequestBodyDataError";
import JwtFilter from "../middlewares/JwtFilter";
import NormalizeArrayProp from "../modifiers/NormalizeArrayProp";
import NormalizeStringProp from "../modifiers/NormalizeStringProp";
import ObjectModifer from "../modifiers/ObjectModifier";
import PickProps from "../modifiers/PickProps";
import BaseResponse from "../payloads/BaseResponse";
import ExceptionHandlerWrapper from "../utils/ExceptionHandlerWrapper";
import resolveMongoFilter from "../utils/resolveMongoFilter";
import isFalsy from "../validations/isFalsy";

const router = express.Router();

router.get("/api/accounts/current/preferences", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;

  const filter: Filter<AccountPreference> = { ownerAccountId: new ObjectId(accountId) };
  const preferences = await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .find(filter)
    .toArray();
  resp.send(new BaseResponse().ok(preferences));
}));

router.put("/api/accounts/current/preferences/:preferenceId", JwtFilter(cfg.SECRET), ExceptionHandlerWrapper(async (req, resp) => {
  const accountId = req.__accountId;
  const preferenceId = new ObjectId(req.params.preferenceId);

  const data = req.body;

  if (isFalsy(data)) throw new MissingRequestBodyDataError();

  const body = new ObjectModifer(data)
    .modify(PickProps(["termId", "wantedSubjectIds"]))
    .modify(NormalizeStringProp("termId"))
    .modify(NormalizeArrayProp("wantedSubjectIds", "string"))
    .collect();
  const filter: Filter<AccountPreference> = { _id: preferenceId, ownerAccountId: new ObjectId(accountId) };
  await mongoConnectionPool.getClient()
    .db(cfg.DATABASE_NAME)
    .collection(AccountPreference.name)
    .updateOne(filter, {
      $set: {
        termId: body.termId,
        wantedSubjectIds: body.wantedSubjectIds
      }
    });
  resp.send(new BaseResponse().ok());
}));

export default router;