import { AppEvent } from "app/cfg";
import { bus } from "app/bus";
import logger from "app/loggers/logger";
import { cachedSettings } from "app/services";

export const setup = () => {
  bus.on(AppEvent.ADD_TERM_IDS, async (termIds: string[]) => {
    logger.info(`add term ids ${termIds}`);
    cachedSettings.addTermIds(termIds);
    await cachedSettings.save();
  });
};