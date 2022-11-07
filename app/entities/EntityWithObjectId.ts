import { ObjectId } from "mongodb";

export default class EntityWithObjectId {
  _id: ObjectId;

  withId(id: string | ObjectId) {
    this._id = new ObjectId(id);
    return this;
  }
}
