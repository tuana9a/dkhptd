/* eslint-disable no-param-reassign */
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { cfg } from "./cfg";
import { c } from "./cypher";
import { DKHPTDJobV1Logs, DKHPTDJobV1, DKHPTDJobV2Logs, DKHPTDJobV2, DKHPTDV1Result, DKHPTDResult, DKHPTDV2Result } from "./entities";

export const toBuffer = (input) => Buffer.from(input);
export const toJson = (input, space?: string | number) => JSON.stringify(input, null, space);
export const toKeyValueString = (input) => Object.keys(input).reduce((agg: string, cur: string) => (`${agg + cur} = ${input[cur]}\n`), "").trim();
export const toNormalizedString = (input) => {
  const safeString = toSafeString(input);
  if (safeString.match(/^"*null"*$/i)) {
    return null;
  }
  if (safeString.match(/^"*undefined"*$/i)) {
    return undefined;
  }
  return safeString.trim().replace(/\s{2,}/g, " ");
};
export const toObjectId = (input) => (input ? null : new ObjectId(input));
export const toSafeArray = <T>(input): T[] => {
  try {
    return Array.from(input);
  } catch (err) {
    return [];
  }
};
export const toSafeInt = (input) => parseInt(input) || 0;
export const toSafeString = (input) => String(input);
export const toSHA256 = (input: string) => crypto.createHash("sha256").update(input).digest("hex");
export const jobToMessage = (input) => ({
  id: input._id,
  name: "DangKyHocPhanTuDong",
  username: input.username,
  password: input.password,
  classIds: input.classIds,
});
export const jobV1ToMessage = (input) => ({
  id: input._id,
  name: "DangKyHocPhanTuDongV1",
  username: input.username,
  password: input.password,
  classIds: input.classIds,
});
export const jobV2ToMessage = (input) => ({
  id: input._id,
  name: "DangKyHocPhanTuDongV2",
  username: input.username,
  password: input.password,
  classIds: input.classIds,
});

let n = 0;

export const nextInt = () => n++;
export const nextStr = () => String(n++);

export const modify = (input, chains: ((...args) => unknown)[]) => {
  let output = input;
  for (const modifier of chains) {
    output = modifier(output);
  }
  return output;
};

export const DropProps = (propNames: string[] = []) => (input) => {
  const output = {};

  const remainKeys = Object.keys(input).filter((key) => !propNames.includes(key));

  for (const propName of remainKeys) {
    output[propName] = input[propName];
  }

  return output;
};

export const NormalizeArrayProp = (propName: string, propType?: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined || !Array.isArray(currentValue)) {
    input[propName] = []; // default for an array;
    return input;
  }

  if (propType === "int") {
    input[propName] = input[propName].map((x) => toSafeInt(x));
    return input;
  }

  if (propType === "string") {
    input[propName] = input[propName].map((x) => toSafeString(x));
    return input;
  }

  // other type do nothing
  return input;
};

export const NormalizeIntProp = (propName: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = toSafeInt(input[propName]);
  return input;
};

export const NormalizeStringProp = (propName: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = toNormalizedString(input[propName]);

  return input;
};

export const PickProps = (propNames: string[] = [], options = { dropFalsy: false }) => (input) => {
  const output = {};

  for (const propName of propNames) {
    if (options?.dropFalsy) {
      if (input[propName]) { // check not falsy value
        output[propName] = input[propName];
      }
    } else {
      output[propName] = input[propName];
    }
  }

  return output;
};

export const ReplaceCurrentPropValueWith = (propName: string, toNewValue = (oldValue): unknown => oldValue) => (input) => {
  const oldValue = input[propName];
  input[propName] = toNewValue(oldValue);
  return input;
};

export const SetProp = (key: string, value: unknown) => (input) => {
  input[key] = value;
  return input;
};

export const loop = {
  infinity: (fn: () => unknown, delay: number) => {
    const call = async () => {
      await fn();
      setTimeout(call, delay);
    };
    call();
  },
};

export const decryptJobV1Logs = (input: DKHPTDJobV1Logs) => {
  const logs: [] = input.logs ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.logs, input.iv)) : [];
  const vars = input.vars ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.vars, input.iv)) : {};
  return {
    _id: input._id,
    jobId: input.jobId,
    ownerAccountId: input.ownerAccountId,
    workerId: input.workerId,
    logs: logs,
    vars: vars,
    createdAt: input.createdAt,
  };
};

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
  };
};

export const decryptJobV2Logs = (input: DKHPTDJobV2Logs) => {
  const logs: [] = input.logs ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.logs, input.iv)) : [];
  const vars = input.vars ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.vars, input.iv)) : {};
  return {
    _id: input._id,
    jobId: input.jobId,
    ownerAccountId: input.ownerAccountId,
    workerId: input.workerId,
    logs: logs,
    vars: vars,
    createdAt: input.createdAt,
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

export const decryptResultV1 = (input: DKHPTDV1Result) => {
  const logs: [] = input.logs ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.logs, input.iv)) : [];
  const vars = input.vars ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.vars, input.iv)) : {};
  return new DKHPTDResult({
    _id: input._id,
    jobId: input.jobId,
    ownerAccountId: input.ownerAccountId,
    workerId: input.workerId,
    logs: logs,
    vars: vars,
    createdAt: input.createdAt,
  });
};

export const decryptResultV2 = (input: DKHPTDV2Result) => {
  const logs: [] = input.logs ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.logs, input.iv)) : [];
  const vars = input.vars ? JSON.parse(c(cfg.JOB_ENCRYPTION_KEY).d(input.vars, input.iv)) : {};
  return new DKHPTDResult({
    _id: input._id,
    jobId: input.jobId,
    ownerAccountId: input.ownerAccountId,
    workerId: input.workerId,
    logs: logs,
    vars: vars,
    createdAt: input.createdAt,
  });
};
