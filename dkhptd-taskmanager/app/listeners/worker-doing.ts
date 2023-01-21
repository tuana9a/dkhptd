import { workerEvent } from "../app-event";
import { workerBus } from "../bus";
import logger from "../loggers/logger";
import { toJson } from "../to";

export const setup = ()=> {
  workerBus.on(workerEvent.WORKER_DOING, (doing) => logger.info(`Doing: ${toJson(doing)}`));
};