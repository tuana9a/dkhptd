import { settingsEvent } from "app/app-event";
import { settingsBus } from "app/bus";
import logger from "app/loggers/logger";
import { cachedSettings } from "app/services";

export const setup = () => {
  settingsBus.on(settingsEvent.ADD_TERM_IDS, async (termIds: string[]) => {
    logger.info(`add term ids ${termIds}`);
    cachedSettings.addTermIds(termIds);
    await cachedSettings.save();
  });
};