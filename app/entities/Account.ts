import DropProps from "../modifiers/DropProps";
import ObjectModifer from "../modifiers/ObjectModifier";
import EntityWithObjectId from "./EntityWithObjectId";

export default class Account extends EntityWithObjectId {
  username: string;
  name: string;
  password: string;

  constructor({ username, name, password }: any) {
    super();
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
