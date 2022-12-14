import { ObjectId } from "mongodb";
import BaseEntity from "./BaseEntity";

export default class AccountHasStudent extends BaseEntity {
  accountId: ObjectId;
  studentId: string;

  constructor({ _id, accountId, studentId }: {
    _id?: ObjectId;
    accountId?: ObjectId;
    studentId?: string;
  }) {
    super(_id);
    this.accountId = accountId;
    this.studentId = studentId;
  }
}
