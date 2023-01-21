import { nextStr } from "./next";

export const jobEvent = {
  NEW_JOB: nextStr(),
  STALE_JOB: nextStr(),
};

export const jobV1Event = {
  NEW_JOB_V1: nextStr(),
  STALE_JOB_V1: nextStr(),
};

export const jobV2Event = {
  NEW_JOB_V2: nextStr(),
  STALE_JOB_V2: nextStr(),
};