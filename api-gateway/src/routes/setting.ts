/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { cfg } from "src/cfg";
import { ExceptionWrapper, IsAdminFilter, JwtFilter } from "src/middlewares";
import { BaseResponse } from "src/payloads";
import { cachedSettings } from "src/services";

const router = express.Router();

router.get("/api/settings/renew-token-every", ExceptionWrapper(async (req, resp) => {
  resp.send(new BaseResponse().ok(cachedSettings.settings.renewTokenEvery));
}));

router.get("/api/settings/refresh-job-every", ExceptionWrapper(async (req, resp) => {
  resp.send(new BaseResponse().ok(cachedSettings.settings.refreshJobEvery));
}));

router.put("/api/settings/renew-token-every", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const every = req.body.every;
  cachedSettings.settings.renewTokenEvery = every;
  await cachedSettings.save();
  resp.send(new BaseResponse().ok(cachedSettings.settings.renewTokenEvery));
}));

router.put("/api/settings/refresh-job-every", JwtFilter(cfg.SECRET), IsAdminFilter(), ExceptionWrapper(async (req, resp) => {
  const every = req.body.every;
  cachedSettings.settings.refreshJobEvery = every;
  await cachedSettings.save();
  resp.send(new BaseResponse().ok(cachedSettings.settings.refreshJobEvery));
}));

export default router;
