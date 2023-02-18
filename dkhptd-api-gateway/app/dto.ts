import crypto from "crypto";
import { modify, DropProps } from "./modifiers";
import { cfg } from "./cfg";
import { c } from "./cypher";
import { DKHPTDJobV1, DKHPTDJobV2, DKHPTDJobV1Result, DKHPTDJobResult, DKHPTDJobV2Result } from "./entities";

export const dropPassword = (input: unknown) => modify(input, [DropProps(["password"])]);

export const decryptJobV1 = (input: DKHPTDJobV1) => {
  const dPassword = c(cfg.JOB_ENCRYPTION_KEY).d(input.password, input.iv);
  const dUsername = c(cfg.JOB_ENCRYPTION_KEY).d(input.username, input.iv);
  return {
    _id: input._id,
    ownerAccountId: input.ownerAccountId,
    username: dUsername,
    password: dPassword,
    classIds: input.classIds,
    timeToStart: input.timeToStart,
    createdAt: input.createdAt,
    doingAt: input.doingAt,
    status: input.status,
    no: input.no,
    termId: input.termId,
  };
};

export const encryptJobV1 = (input: DKHPTDJobV1) => {
  const iv = crypto.randomBytes(16).toString("hex");
  const ePassword = c(cfg.JOB_ENCRYPTION_KEY).e(input.password, iv);
  const eUsername = c(cfg.JOB_ENCRYPTION_KEY).e(input.username, iv);
  return {
    _id: input._id,
    ownerAccountId: input.ownerAccountId,
    username: eUsername,
    password: ePassword,
    classIds: input.classIds,
    timeToStart: input.timeToStart,
    createdAt: input.createdAt,
    doingAt: input.doingAt,
    status: input.status,
    iv: iv,
    termId: input.termId,
  };
};

export const decryptJobV2 = (input: DKHPTDJobV2) => {
  const dPassword = c(cfg.JOB_ENCRYPTION_KEY).d(input.password, input.iv);
  const dUsername = c(cfg.JOB_ENCRYPTION_KEY).d(input.username, input.iv);
  return new DKHPTDJobV2({
    _id: input._id,
    ownerAccountId: input.ownerAccountId,
    username: dUsername,
    password: dPassword,
    classIds: input.classIds,
    timeToStart: input.timeToStart,
    createdAt: input.createdAt,
    doingAt: input.doingAt,
    status: input.status,
  });
};

export const encryptJobV2 = (input: DKHPTDJobV2) => {
  const iv = crypto.randomBytes(16).toString("hex");
  const ePassword = c(cfg.JOB_ENCRYPTION_KEY).e(input.password, iv);
  const eUsername = c(cfg.JOB_ENCRYPTION_KEY).e(input.username, iv);
  return new DKHPTDJobV2({
    _id: input._id,
    ownerAccountId: input.ownerAccountId,
    username: eUsername,
    password: ePassword,
    classIds: input.classIds,
    timeToStart: input.timeToStart,
    createdAt: input.createdAt,
    doingAt: input.doingAt,
    status: input.status,
    iv: iv,
  });
};

export const decryptJobV1Result = (input: DKHPTDJobV1Result) => {
  const logs: [] = input.logs ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.logs, input.iv)) : [];
  const vars = input.vars ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.vars, input.iv)) : {};
  return new DKHPTDJobResult({
    _id: input._id,
    jobId: input.jobId,
    ownerAccountId: input.ownerAccountId,
    workerId: input.workerId,
    logs: logs,
    vars: vars,
    createdAt: input.createdAt,
  });
};

export const decryptJobV2Result = (input: DKHPTDJobV2Result) => {
  const logs: [] = input.logs ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.logs, input.iv)) : [];
  const vars = input.vars ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.vars, input.iv)) : {};
  return new DKHPTDJobResult({
    _id: input._id,
    jobId: input.jobId,
    ownerAccountId: input.ownerAccountId,
    workerId: input.workerId,
    logs: logs,
    vars: vars,
    createdAt: input.createdAt,
  });
};