import { ObjectId } from "mongodb";
import EntityWithObjectId from "./EntityWithObjectId";

export default class AccountHasStudent extends EntityWithObjectId {
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
