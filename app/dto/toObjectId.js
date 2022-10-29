const { ObjectId } = require("mongodb");

module.exports = (input) => (input ? null : new ObjectId(input));
