import { ObjectId } from "mongodb";

export default class Query {
  key: string;
  operator: string;
  value;

  constructor(key: string, operator: string, value: string) {
    this.key = key;
    this.operator = operator;
    try {
      if (value.match(/^\d+$/)) {
        this.value = parseInt(value);
      } else if (ObjectId.isValid(value)) {
        this.value = new ObjectId(value);
      } else {
        this.value = value;
      }
    } catch (err) {
      this.value = value;
    }
  }

  isValid() {
    return this.key && this.operator;
  }
}
