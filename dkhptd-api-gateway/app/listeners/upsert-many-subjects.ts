import { bus } from "app/bus";
import { cfg, CollectionName, AppEvent } from "app/cfg";
import { mongoConnectionPool } from "app/connections";
import { Subject } from "app/entities";
import logger from "app/loggers/logger";

export const setup = () => {
  bus.on(AppEvent.UPSERT_MANY_SUBJECTS, async (subjects: Subject[]) => {
    logger.info(`Upsert many subjects count ${subjects.length}`);
    try {
      for (const s of subjects) {
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME)
          .collection(CollectionName.SUBJECT)
          .replaceOne({ subjectId: s.subjectId }, s, { upsert: true });
      }
    } catch (err) {
      logger.error(err);
    }
  });
};