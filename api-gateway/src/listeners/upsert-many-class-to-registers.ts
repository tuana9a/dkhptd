import { bus } from "src/bus";
import { cfg, CollectionName, AppEvent } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { ClassToRegister } from "src/entities";
import logger from "src/loggers/logger";

export default () => {
  bus.on(AppEvent.UPSERT_MANY_CTR, async (classes: ClassToRegister[]) => {
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