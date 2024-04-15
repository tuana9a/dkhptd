import { AppEvent } from "src/cfg";
import { bus } from "src/bus";
import logger from "src/loggers/logger";
import { cachedSettings } from "src/services";

export const setup = () => {
  bus.on(AppEvent.REPLACE_TERM_IDS, async (termIds: string[]) => {
    logger.info(`replace term ids ${termIds}`);
    cachedSettings.replaceTermIds(termIds);
    await cachedSettings.save();
  });
};