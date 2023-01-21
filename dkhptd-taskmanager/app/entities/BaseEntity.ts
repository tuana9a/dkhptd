import { ObjectId } from "mongodb";

export default class BaseEntity {
  _id: ObjectId;

  constructor(_id: ObjectId) {
    this._id = _id;
  }
}
