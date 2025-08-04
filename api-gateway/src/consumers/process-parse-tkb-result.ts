import { QueueName, AppEvent } from "src/cfg";
import { toCTR } from "src/dto";
import { ClassToRegister, Subject } from "src/entities";
import { modify, m } from "src/modifiers";
import { ParsedClassToRegister } from "src/payloads";
import { bus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import logger from "../loggers/logger";

export default () => {
  rabbitmqConnectionPool.getChannel().assertQueue(QueueName.PROCESS_PARSE_TKB_XLSX_RESULT, {}, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }

    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const result: { data: ParsedClassToRegister[], error: any } = JSON.parse(msg.content.toString());
        if (result.error) {
          logger.error(result.error);
          rabbitmqConnectionPool.getChannel().ack(msg);
          return;
        }
        try {
          logger.info(`Received parsed class to register, count: ${result.data.length}`);
          const classes = result.data
            .map((x) => new ParsedClassToRegister(x))
            .map((x) => toCTR(x))
            .map((x) => modify(x, [
              m.normalizeInt("classId"),
              m.normalizeInt("secondClassId"),
              m.normalizeString("subjectId"),
              m.normalizeString("subjectName"),
              m.normalizeString("classType"),
              m.normalizeInt("learnDayNumber"),
              m.normalizeInt("learnAtDayOfWeek"),
              m.normalizeString("learnTime"),
              m.normalizeString("learnRoom"),
              m.normalizeString("learnWeek"),
              m.normalizeString("describe"),
              m.normalizeString("termId"),
              m.set("createdAt", Date.now()),
            ]))
            .map((x) => new ClassToRegister(x));
          const termIds = Array.from(classes.reduce((t, c) => t.add(c.termId), new Set<string>()));
          const subjects = Array.from(classes.reduce((t, c) => t.set(c.subjectId, new Subject({ subjectId: c.subjectId, subjectName: c.subjectName })), new Map<string, Subject>()).values());
          bus.emit(AppEvent.ADD_TERM_IDS, termIds);
          bus.emit(AppEvent.UPSERT_MANY_CTR, classes);
          bus.emit(AppEvent.UPSERT_MANY_SUBJECTS, subjects);
        } catch (err) {
          logger.error(err);
        }
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
