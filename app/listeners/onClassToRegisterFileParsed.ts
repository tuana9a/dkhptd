import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import ClassToRegister from "../entities/ClassToRegister";
import logger from "../loggers/logger";
import NormalizeIntProp from "../modifiers/NormalizeIntProp";
import NormalizeStringProp from "../modifiers/NormalizeStringProp";
import ObjectModifer from "../modifiers/ObjectModifier";
import SetProp from "../modifiers/SetProp";
import ParsedClassToRegister from "../payloads/ParsedClassToRegister";
import emitter from "./emiter";

export default {
  setup() {
    emitter.on(AppEvent.CLASS_TO_REGISTER_FILE_PARSED, async (result: { data: ParsedClassToRegister[] }) => {
      try {
        logger.info(`Received parsed class to register, count: ${result.data.length}`);
        const classes = result.data.map(x => new ParsedClassToRegister(x))
          .map(x => x.toCTR())
          .map(x => new ObjectModifer(x)
            .modify(NormalizeIntProp("classId"))
            .modify(NormalizeIntProp("secondClassId"))
            .modify(NormalizeStringProp("subjectId"))
            .modify(NormalizeStringProp("subjectName"))
            .modify(NormalizeStringProp("classType"))
            .modify(NormalizeIntProp("learnDayNumber"))
            .modify(NormalizeIntProp("learnAtDayOfWeek"))
            .modify(NormalizeStringProp("learnTime"))
            .modify(NormalizeStringProp("learnRoom"))
            .modify(NormalizeStringProp("learnWeek"))
            .modify(NormalizeStringProp("describe"))
            .modify(NormalizeStringProp("termId"))
            .modify(SetProp("createdAt", Date.now()))
            .collect())
          .map(x => new ClassToRegister(x));
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(ClassToRegister.name).insertMany(classes);
      } catch (err) {
        logger.error(err);
      }
    });
  }
};
