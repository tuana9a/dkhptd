import EventEmitter from "events";

export const jobBus = new EventEmitter();
export const jobV1Bus = new EventEmitter();
export const jobV2Bus = new EventEmitter();

export const workerBus = new EventEmitter();
