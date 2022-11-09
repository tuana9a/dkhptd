import { ObjectId } from "mongodb";
import EntityWithObjectId from "./EntityWithObjectId";

export default class ClassToRegister extends EntityWithObjectId {
  classId: string;
  secondClassId: string;
  learnDayNumber: number;
  classType: string;
  subjectId: string;
  subjectName: string;
  learnAtDayOfWeek: number;
  learnTime: string;
  room: string;
  learnWeek: string;
  describe: string;
  termId: string;
  createdAt: number;

  constructor({
    _id,
    classId,
    secondClassId,
    classType,
    subjectId,
    subjectName,
    learnDayNumber,
    learnAtDayOfWeek,
    learnTime,
    room,
    learnWeek,
    describe,
    termId,
    createdAt,
  }: {
    _id?: ObjectId;
    classId?: string;
    secondClassId?: string;
    learnDayNumber?: number;
    classType?: string;
    subjectId?: string;
    subjectName?: string;
    learnAtDayOfWeek?: number;
    learnTime?: string;
    room?: string;
    learnWeek?: string;
    describe?: string;
    termId?: string;
    createdAt?: number;
  }) {
    super(_id);
    this.classId = classId;
    this.secondClassId = secondClassId;
    this.classType = classType;
    this.subjectId = subjectId;
    this.subjectName = subjectName;
    this.learnDayNumber = learnDayNumber;
    this.learnAtDayOfWeek = learnAtDayOfWeek;
    this.learnTime = learnTime;
    this.room = room;
    this.learnWeek = learnWeek;
    this.describe = describe;
    this.termId = termId;
    this.createdAt = createdAt;
  }
}
