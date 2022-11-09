import { ObjectId } from "mongodb";

export default class EntityWithObjectId {
  _id: ObjectId;

  constructor(_id: ObjectId) {
    this._id = _id;
  }

  withId(id: string | ObjectId) {
    this._id = new ObjectId(id);
    return this;
  }
}
