const toNormalizedString = require("../dto/toNormalizedString");

module.exports = (input) => {
  const output = toNormalizedString(input).split(",").map((x) => toNormalizedString(x)).filter((x) => x);
  return output;
};
