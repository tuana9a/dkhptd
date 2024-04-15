/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { cfg } from "src/cfg";
import { FaslyValueError, NotAnArrayError } from "src/exceptions";
import { ExceptionWrapper, IsAdminFilter, JwtFilter } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { isFalsy } from "src/utils";
import { cachedSettings } from "src/services";

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
