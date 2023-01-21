import { ObjectId } from "mongodb";
import BaseEntity from "./BaseEntity";

export default class StudentRegisterClassPreference extends BaseEntity {
  studentId: string;
  termId: string;
  wantedSubjectIds: string[];

  constructor({ _id, studentId, termId, wantedSubjectIds }: {
    _id?: ObjectId;
    studentId?: string;
    termId?: string;
    wantedSubjectIds?: string[];
  }) {
    super(_id);
    this.studentId = studentId;
    this.termId = termId;
    this.wantedSubjectIds = wantedSubjectIds;
  }
}
