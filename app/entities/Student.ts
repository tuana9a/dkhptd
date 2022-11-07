import EntityWithObjectId from "./EntityWithObjectId";

export default class Student extends EntityWithObjectId {
  email: string;

  constructor({ _id, email }) {
    super();
    this._id = _id;
    this.email = email;
  }
}
