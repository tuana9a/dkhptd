import AppEvent from "../configs/AppEvent";
import logger from "../loggers/logger";
import toJson from "../utils/toJson";
import emitter from "./emiter";

export default {
  setup() {
    emitter.on(AppEvent.PING, (ping) => logger.info(`Ping: ${toJson(ping)}`));
  }
};
