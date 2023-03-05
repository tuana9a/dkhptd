/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { cfg } from "app/cfg";
import { ExceptionWrapper, IsAdminFilter, JwtFilter } from "app/middlewares";
import BaseResponse from "app/payloads/BaseResponse";
import { cachedSettings } from "app/services";

export const router = express.Router();

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
