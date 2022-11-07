import { ObjectId } from "mongodb";
import EntityWithObjectId from "./EntityWithObjectId";

export default class AccountPreference extends EntityWithObjectId {
  secret: string;

  ownerAccountId: ObjectId;

  constructor({ _id, secret, ownerAccountId }) {
    super();
    this._id = _id;
    this.secret = secret;
    this.ownerAccountId = ownerAccountId;
  }
}
