import { AppEvent } from "app/cfg";
import { bus } from "app/bus";
import logger from "app/loggers/logger";
import { cachedSettings } from "app/services";

export const setup = () => {
  bus.on(AppEvent.REPLACE_TERM_IDS, async (termIds: string[]) => {
    logger.info(`replace term ids ${termIds}`);
    cachedSettings.replaceTermIds(termIds);
    await cachedSettings.save();
  });
};