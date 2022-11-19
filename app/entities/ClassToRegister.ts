import { ObjectId } from "mongodb";
import EntityWithObjectId from "./EntityWithObjectId";

export default class ClassToRegister extends EntityWithObjectId {
  classId: number;
  secondClassId: number;
  learnDayNumber: number;
  classType: string;
  subjectId: string;
  subjectName: string;
  learnAtDayOfWeek: number;
  learnTime: string;
  learnRoom: string;
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
    learnRoom,
    learnWeek,
    describe,
    termId,
    createdAt,
  }: {
    _id?: ObjectId;
    classId?: number;
    secondClassId?: number;
    learnDayNumber?: number;
    classType?: string;
    subjectId?: string;
    subjectName?: string;
    learnAtDayOfWeek?: number;
    learnTime?: string;
    learnRoom?: string;
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
    this.learnRoom = learnRoom;
    this.learnWeek = learnWeek;
    this.describe = describe;
    this.termId = termId;
    this.createdAt = createdAt;
  }
}
