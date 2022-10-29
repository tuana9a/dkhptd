/* eslint-disable no-param-reassign */
module.exports = (key, value) => (input) => {
  input[key] = value;
  return input;
};
