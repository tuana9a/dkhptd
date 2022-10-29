const NotAndArrayError = require("../exceptions/NotAnArrayError");

module.exports = (size) => (input) => {
  if (!Array.isArray(input)) throw new NotAndArrayError(input);
  if (input.length > size) return true;
  return false;
};
