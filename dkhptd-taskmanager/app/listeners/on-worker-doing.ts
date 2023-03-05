import { workerEvent } from "../app-event";
import { workerBus } from "../bus";
import { cfg } from "../cfg";
import logger from "../loggers/logger";
import { toJson } from "../utils";

export const setup = () => {
  if (cfg.LOG_WORKER_DOING) workerBus.on(workerEvent.WORKER_DOING, (doing) => logger.info(`Doing: ${toJson(doing)}`));
};