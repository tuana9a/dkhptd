import { workerEvent } from "../app-event";
import { workerBus } from "../bus";
import logger from "../loggers/logger";
import { toJson } from "../utils";

export const setup = () => {
  // workerBus.on(workerEvent.WORKER_PING, (ping) => logger.info(`Ping: ${toJson(ping)}`));
};
