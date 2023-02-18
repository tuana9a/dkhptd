import { classToRegisterEvent } from "app/app-event";
import { classToRegisterBus } from "app/bus";
import { cfg, CollectionName } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { ClassToRegister } from "app/entities";
import logger from "app/loggers/logger";

export const setup = () => {
  classToRegisterBus.on(classToRegisterEvent.UPSERT_MANY_CTR, async (classes: ClassToRegister[]) => {
    logger.info(`Upsert many class to register count ${classes.length}`);
    try {
      for (const c of classes) {
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME)
          .collection(CollectionName.CTR)
          .replaceOne({ classId: c.classId, termId: c.termId, learnDayNumber: c.learnDayNumber }, c, { upsert: true });
      }
    } catch (err) {
      logger.error(err);
    }
  });
};