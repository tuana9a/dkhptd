const DropProps = require("../modifiers/DropProps");
const ObjectModifer = require("../modifiers/ObjectModifier");
const EntityWithObjectId = require("./EntityWithObjectId");

class Account extends EntityWithObjectId {
  constructor({ username, name, password }) {
    super();
    this.username = username;
    this.name = name;
    this.password = password;
  }

  toClient() {
    return new ObjectModifer([DropProps("password")]).apply(this);
  }
}

module.exports = Account;
