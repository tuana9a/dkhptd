import { AppEvent } from "src/cfg";
import { bus } from "src/bus";
import logger from "src/loggers/logger";
import { settingsService } from "src/services";

export default () => {
  bus.on(AppEvent.REPLACE_TERM_IDS, async (termIds: string[]) => {
    logger.info(`replace term ids ${termIds}`);
    settingsService.setTermIds(termIds);
    await settingsService.save();
  });
};