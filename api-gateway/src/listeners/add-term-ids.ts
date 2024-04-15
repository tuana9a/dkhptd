import { AppEvent } from "src/cfg";
import { bus } from "src/bus";
import logger from "src/loggers/logger";
import { cachedSettings } from "src/services";

export const setup = () => {
  bus.on(AppEvent.ADD_TERM_IDS, async (termIds: string[]) => {
    logger.info(`add term ids ${termIds}`);
    cachedSettings.addTermIds(termIds);
    await cachedSettings.save();
  });
};