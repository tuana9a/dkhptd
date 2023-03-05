import { workerEvent } from "../app-event";
import { workerBus } from "../bus";
import { cfg } from "../cfg";
import logger from "../loggers/logger";
import { toJson } from "../utils";

export const setup = () => {
  if (cfg.LOG_WORKER_PING) workerBus.on(workerEvent.WORKER_PING, (ping) => logger.info(`Ping: ${toJson(ping)}`));
};
