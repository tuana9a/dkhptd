/* eslint-disable no-param-reassign */

import toSafeInt from "../dto/toSafeInt";
import toSafeString from "../dto/toSafeString";

export default (propName: string, propType: string, defaultValue: any) => (input: any) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined || !Array.isArray(currentValue)) {
    if (defaultValue) {
      input[propName] = []; // default for an array;
    }
    return input;
  }

  if (propType === "int") {
    input[propName] = input[propName].map((x) => toSafeInt(x));
    return input;
  }

  if (propType === "string") {
    input[propName] = input[propName].map((x) => toSafeString(x));
    return input;
  }

  if (!propType || propType === "object") {
    // do nothing
    return input;
  }

  return input;
};
