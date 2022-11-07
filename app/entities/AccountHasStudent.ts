import { ObjectId } from "mongodb";
import EntityWithObjectId from "./EntityWithObjectId";

export default class AccountHasStudent extends EntityWithObjectId {
  accountId: ObjectId;
  studentId: string;

  constructor({ accountId, studentId }) {
    super();
    this.accountId = accountId;
    this.studentId = studentId;
  }
}
