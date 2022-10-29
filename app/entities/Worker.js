const EntityWithObjectId = require("./EntityWithObjectId");

class Worker extends EntityWithObjectId {
  constructor({ id }) {
    super();
    this.id = id; // replace default ObjectId
  }
}

module.exports = Worker;
