import { ObjectId } from "mongodb";
import EntityWithObjectId from "./EntityWithObjectId";

export default class StudentPreference extends EntityWithObjectId {
  ownerAccountId: ObjectId;
  termId: string;
  wantedCourses: string[];

  constructor({ _id, ownerAccountId, termId, wantedCourses }) {
    super();
    this._id = _id;
    this.ownerAccountId = ownerAccountId;
    this.termId = termId;
    this.wantedCourses = wantedCourses;
  }
}
