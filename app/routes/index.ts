import express from "express";
import accountsDkhptdsLogsRouter from "./accounts-dkhptd-s-logs";
import accountsDkhptdsRouter from "./accounts-dkhptd-s";
import accountsV1DkhptdsLogsRouter from "./accounts-v1-dkhptd-s-logs";
import accountsV1DkhptdsRouter from "./accounts-v1-dkhptd-s";
import accountsV2DkhptdsLogsRouter from "./accounts-v2-dkhptd-s-logs";
import accountsV2DkhptdsRouter from "./accounts-v2-dkhptd-s";
import accountsRouter from "./accounts";
import classToRegistersRouter from "./class-to-registers";
import publicRouter from "./public";
import termIdsClassToRegistersRouter from "./term-ids-class-to-registers";
import accountsPreferencesRouter from "./accounts-preferences";

const router = express.Router();
router.use(accountsDkhptdsLogsRouter);
router.use(accountsDkhptdsRouter);
router.use(accountsV1DkhptdsLogsRouter);
router.use(accountsV1DkhptdsRouter);
router.use(accountsV2DkhptdsLogsRouter);
router.use(accountsV2DkhptdsRouter);
router.use(classToRegistersRouter);
router.use(termIdsClassToRegistersRouter);
router.use(publicRouter);
router.use(accountsRouter);
router.use(accountsPreferencesRouter);

export default router;