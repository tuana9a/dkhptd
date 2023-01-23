import { tkbEvent } from "../app-event";
import { tkbBus } from "../bus";
import { cfg } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { ClassToRegister } from "../entities";
import logger from "../loggers/logger";
import { modify, NormalizeIntProp, NormalizeStringProp, SetProp } from "../utils";
import ParsedClassToRegister from "../payloads/ParsedClassToRegister";

export const setup = () => {
  tkbBus.on(tkbEvent.TKB_XLSX_PARSED, async (result: { data: ParsedClassToRegister[] }) => {
    try {
      logger.info(`Received parsed class to register, count: ${result.data.length}`);
      const classes = result.data
        .map((x) => new ParsedClassToRegister(x))
        .map((x) => x.toCTR())
        .map((x) => modify(x, [
          NormalizeIntProp("classId"),
          NormalizeIntProp("secondClassId"),
          NormalizeStringProp("subjectId"),
          NormalizeStringProp("subjectName"),
          NormalizeStringProp("classType"),
          NormalizeIntProp("learnDayNumber"),
          NormalizeIntProp("learnAtDayOfWeek"),
          NormalizeStringProp("learnTime"),
          NormalizeStringProp("learnRoom"),
          NormalizeStringProp("learnWeek"),
          NormalizeStringProp("describe"),
          NormalizeStringProp("termId"),
          SetProp("createdAt", Date.now()),
        ]))
        .map((x) => new ClassToRegister(x));
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).insertMany(classes);
    } catch (err) {
      logger.error(err);
    }
  });
};
