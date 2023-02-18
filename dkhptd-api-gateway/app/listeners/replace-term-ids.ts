import { settingsEvent } from "app/app-event";
import { settingsBus } from "app/bus";
import logger from "app/loggers/logger";
import { cachedSettings } from "app/services";

export const setup = () => {
  settingsBus.on(settingsEvent.REPLACE_TERM_IDS, async (termIds: string[]) => {
    logger.info(`replace term ids ${termIds}`);
    cachedSettings.replaceTermIds(termIds);
    await cachedSettings.save();
  });
};