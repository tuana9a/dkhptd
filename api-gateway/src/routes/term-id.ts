/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { cfg } from "src/cfg";
import { FaslyValueError, NotAnArrayError } from "src/exceptions";
import { ExceptionWrapper, IsAdminFilter, JwtFilter } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { isFalsy } from "src/utils";
import { settingsService } from "src/services";

const router = express.Router();

router.get("/api/term-ids", ExceptionWrapper(async (req, resp) => {
  resp.send(new BaseResponse().ok(settingsService.getTermIds()));
}));

router.post("/api/term-ids", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const termIds = req.body.data;
  if (isFalsy(termIds)) throw new FaslyValueError("body.data");
  if (!Array.isArray(termIds)) throw new NotAnArrayError("body.data");
  settingsService.addTermIds(termIds);
  await settingsService.save();
  resp.send(new BaseResponse().ok(settingsService.getTermIds()));
}));

router.put("/api/term-ids", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const termIds = req.body.data;
  if (isFalsy(termIds)) throw new FaslyValueError("body.data");
  if (!Array.isArray(termIds)) throw new NotAnArrayError("body.data");
  settingsService.setTermIds(termIds);
  await settingsService.save();
  resp.send(new BaseResponse().ok(settingsService.getTermIds()));
}));

export default router;
