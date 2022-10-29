const EntityWithObjectId = require("./EntityWithObjectId");

class AccountHasStudent extends EntityWithObjectId {
  constructor({ accountId, studentId }) {
    super();
    this.accountId = accountId;
    this.studentId = studentId;
  }
}

module.exports = AccountHasStudent;
