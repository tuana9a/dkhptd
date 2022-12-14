import ClassToRegister from "../entities/ClassToRegister";

export default class ParsedClassToRegister {
  class_id: number;
  second_class_id: number;
  learn_day_number: number;
  class_type: string;
  subject_id: string;
  subject_name: string;
  learn_at_day_of_week: number;
  learn_time: string;
  learn_room: string;
  learn_week: string;
  describe: string;
  term_id: string;
  created_at: number;

  constructor({
    class_id,
    second_class_id,
    class_type,
    subject_id,
    subject_name,
    learn_day_number,
    learn_at_day_of_week,
    learn_time,
    learn_room,
    learn_week,
    describe,
    term_id,
    created_at,
  }: {
    class_id?: number;
    second_class_id?: number;
    learn_day_number?: number;
    class_type?: string;
    subject_id?: string;
    subject_name?: string;
    learn_at_day_of_week?: number;
    learn_time?: string;
    learn_room?: string;
    learn_week?: string;
    describe?: string;
    term_id?: string;
    created_at?: number;
  }) {
    this.term_id = term_id;
    this.class_id = class_id;
    this.second_class_id = second_class_id;
    this.class_type = class_type;
    this.subject_id = subject_id;
    this.subject_name = subject_name;
    this.learn_day_number = learn_day_number;
    this.learn_at_day_of_week = learn_at_day_of_week;
    this.learn_time = learn_time;
    this.learn_room = learn_room;
    this.learn_week = learn_week;
    this.describe = describe;
    this.created_at = created_at;
  }

  toCTR() {
    return new ClassToRegister({
      classId: this.class_id,
      secondClassId: this.second_class_id,
      classType: this.class_type,
      subjectId: this.subject_id,
      subjectName: this.subject_name,
      learnDayNumber: this.learn_day_number,
      learnAtDayOfWeek: this.learn_at_day_of_week,
      learnTime: this.learn_time,
      learnRoom: this.learn_room,
      learnWeek: this.learn_week,
      describe: this.describe,
      termId: this.term_id,
    });
  }
}
