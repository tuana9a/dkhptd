import { ObjectId } from "mongodb";
import { modify, DropProps } from "../modifiers";
import BaseEntity from "./BaseEntity";

export default class Account extends BaseEntity {
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
    return modify(this, [DropProps(["password"])]);
  }
}
