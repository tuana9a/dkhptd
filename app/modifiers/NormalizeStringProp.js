const toNormalizedString = require("../dto/toNormalizedString");

/* eslint-disable no-param-reassign */
module.exports = (propName) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = toNormalizedString(input[propName]);

  return input;
};
