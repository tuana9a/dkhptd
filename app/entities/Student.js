const EntityWithObjectId = require("./EntityWithObjectId");

class Student extends EntityWithObjectId {
  constructor({ mssv, email }) {
    super();
    this.mssv = mssv;
    this.email = email;
  }
}

module.exports = Student;
