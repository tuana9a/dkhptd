import { ObjectId } from "mongodb";
import EntityWithObjectId from "./EntityWithObjectId";

export default class AccountPreference extends EntityWithObjectId {
  secret: string;

  ownerAccountId: ObjectId;

  constructor({ _id, secret, ownerAccountId }: {
    _id?: ObjectId;
    secret?: string;
    ownerAccountId: ObjectId;
  }) {
    super(_id);
    this.secret = secret;
    this.ownerAccountId = ownerAccountId;
  }
}
