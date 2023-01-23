/* eslint-disable @typescript-eslint/no-var-requires */

import express, { RequestHandler } from "express";
import { toSafeString } from "../../../../utils";

const router = express.Router();

const injectTermId: RequestHandler = (req, resp, next) => {
  req.__termId = toSafeString(req.params.termId);
  next();
};

router.use("", injectTermId);

export default router;