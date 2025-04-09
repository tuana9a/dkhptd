import { bus } from "src/bus";
import { cfg, CollectionName, AppEvent } from "src/cfg";
import { mongoConnectionPool } from "src/connections";
import { Subject } from "src/entities";
import logger from "src/loggers/logger";

export default () => {
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