/* eslint-disable @typescript-eslint/no-var-requires */

import express from "express";
import { ExceptionWrapper } from "src/middlewares";

const router = express.Router();

router.get("/", ExceptionWrapper(async (req, resp) => resp.send("server is online")));

export default router;
