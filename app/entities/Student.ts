import { ObjectId } from "mongodb";
import BaseEntity from "./BaseEntity";

export default class Student extends BaseEntity {
  studentId: string;
  email: string;

  constructor({ _id, studentId, email }: {
    _id?: ObjectId;
    studentId?: string;
    email?: string;
  }) {
    super(_id);
    this.studentId = studentId;
    this.email = email;
  }
}
