import { AppEvent } from "src/cfg";
import { bus } from "src/bus";
import logger from "src/loggers/logger";
import { settingsService } from "src/services";

export default () => {
  bus.on(AppEvent.ADD_TERM_IDS, async (termIds: string[]) => {
    logger.info(`add term ids ${termIds}`);
    settingsService.addTermIds(termIds);
    await settingsService.save();
  });
};