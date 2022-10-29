const { ObjectId } = require("mongodb");
const toNormalizedString = require("../dto/toNormalizedString");

class Query {
  constructor(key, operator, value) {
    this.key = key;
    this.operator = operator;
    try {
      if (Number.isSafeInteger(value)) {
        this.value = parseInt(value);
      } else if (ObjectId.isValid(value)) {
        this.value = new ObjectId(value);
      } else {
        this.value = toNormalizedString(value);
      }
    } catch (err) {
      this.value = value;
    }
  }

  isValid() {
    return this.key && this.operator && this.value;
  }
}

module.exports = Query;
