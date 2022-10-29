const toSafeInt = require("../dto/toSafeInt");

/* eslint-disable no-param-reassign */
module.exports = (propName) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = toSafeInt(input[propName]);
  return input;
};
