const EntityWithObjectId = require("./EntityWithObjectId");

class Account extends EntityWithObjectId {
  constructor({ username, name, password }) {
    super();
    this.username = username;
    this.name = name;
    this.password = password;
  }
}

module.exports = Account;
