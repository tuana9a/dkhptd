import { classToRegisterEvent, settingsEvent, subjectEvent, tkbEvent } from "../app-event";
import { classToRegisterBus, settingsBus, subjectBus, tkbBus } from "../bus";
import { ClassToRegister, Subject } from "../entities";
import logger from "../loggers/logger";
import { modify, m } from "../modifiers";
import ParsedClassToRegister from "../payloads/ParsedClassToRegister";

export const setup = () => {
  tkbBus.on(tkbEvent.TKB_XLSX_PARSED, async (result: { data: ParsedClassToRegister[] }) => {
    try {
      logger.info(`Received parsed class to register, count: ${result.data.length}`);
      const classes = result.data
        .map((x) => new ParsedClassToRegister(x))
        .map((x) => x.toCTR())
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
      settingsBus.emit(settingsEvent.ADD_TERM_IDS, termIds);
      classToRegisterBus.emit(classToRegisterEvent.UPSERT_MANY_CTR, classes);
      subjectBus.emit(subjectEvent.UPSERT_MANY_SUBJECTS, subjects);
    } catch (err) {
      logger.error(err);
    }
  });
};
