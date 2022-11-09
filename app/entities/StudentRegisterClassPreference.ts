import { ObjectId } from "mongodb";
import EntityWithObjectId from "./EntityWithObjectId";

export default class StudentRegisterClassPreference extends EntityWithObjectId {
  studentId: string;
  termId: string;
  wantedCourses: string[];

  constructor({ _id, studentId, termId, wantedCourses }: {
    _id?: ObjectId;
    studentId?: string;
    termId?: string;
    wantedCourses?: string[];
  }) {
    super(_id);
    this.studentId = studentId;
    this.termId = termId;
    this.wantedCourses = wantedCourses;
  }
}
