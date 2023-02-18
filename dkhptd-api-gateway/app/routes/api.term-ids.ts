/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { cfg } from "app/cfg";
import { FaslyValueError, NotAnArrayError } from "app/exceptions";
import { ExceptionWrapper, IsAdminFilter, JwtFilter } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";
import { isFalsy } from "app/utils";
import { cachedSettings } from "app/services";

export const router = express.Router();

router.get("/api/term-ids", ExceptionWrapper(async (req, resp) => {
  resp.send(new BaseResponse().ok(cachedSettings.getTermIds()));
}));

router.post("/api/term-ids", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const termIds = req.body.data;
  if (isFalsy(termIds)) throw new FaslyValueError("body.data");
  if (!Array.isArray(termIds)) throw new NotAnArrayError("body.data");
  cachedSettings.addTermIds(termIds);
  await cachedSettings.save();
  resp.send(new BaseResponse().ok(cachedSettings.getTermIds()));
}));

router.put("/api/term-ids", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const termIds = req.body.data;
  if (isFalsy(termIds)) throw new FaslyValueError("body.data");
  if (!Array.isArray(termIds)) throw new NotAnArrayError("body.data");
  cachedSettings.replaceTermIds(termIds);
  await cachedSettings.save();
  resp.send(new BaseResponse().ok(cachedSettings.getTermIds()));
}));
