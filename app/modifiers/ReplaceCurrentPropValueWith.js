/* eslint-disable no-param-reassign */
module.exports = (propName, toNewValue = (oldValue) => oldValue) => (input) => {
  const oldValue = input[propName];
  input[propName] = toNewValue(oldValue);
  return input;
};
