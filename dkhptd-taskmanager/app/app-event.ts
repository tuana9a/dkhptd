import { nextStr } from "./utils";

export const jobEvent = {
  NEW_JOB: nextStr(),
  NEW_JOB_RESULT: nextStr(),
  STALE_JOB: nextStr(),
};

export const jobV1Event = {
  NEW_JOB_V1: nextStr(),
  NEW_JOB_V1_RESULT: nextStr(),
  STALE_JOB_V1: nextStr(),
};

export const jobV2Event = {
  NEW_JOB_V2: nextStr(),
  NEW_JOB_V2_RESULT: nextStr(),
  STALE_JOB_V2: nextStr(),
};

export const workerEvent = {
  WORKER_DOING: nextStr(),
  WORKER_PING: nextStr(),
};