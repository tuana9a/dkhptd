const { ObjectId } = require("mongodb");

class EntityWithObjectId {
  _id;

  withId(id) {
    this._id = new ObjectId(id);
    return this;
  }
}

module.exports = EntityWithObjectId;
