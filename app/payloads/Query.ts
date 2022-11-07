import { ObjectId } from "mongodb";
import toNormalizedString from "../dto/toNormalizedString";

export default class Query {
  key: string;
  operator: string;
  value: any;

  constructor(key: string, operator: string, value: string) {
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
