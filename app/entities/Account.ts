import { ObjectId } from "mongodb";
import DropProps from "../modifiers/DropProps";
import ObjectModifer from "../modifiers/ObjectModifier";
import EntityWithObjectId from "./EntityWithObjectId";

export default class Account extends EntityWithObjectId {
  username: string;
  name: string;
  password: string;

  constructor({ _id, username, name, password }: {
    _id?: ObjectId;
    username?: string;
    name?: string;
    password?: string;
  }) {
    super(_id);
    this.username = username;
    this.name = name;
    this.password = password;
  }

  toClient() {
    return new ObjectModifer(this)
      .modify(DropProps(["password"]))
      .collect();
  }
}
