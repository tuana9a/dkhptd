import { ObjectId } from "mongodb";
import EntityWithObjectId from "./EntityWithObjectId";

export default class Student extends EntityWithObjectId {
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
