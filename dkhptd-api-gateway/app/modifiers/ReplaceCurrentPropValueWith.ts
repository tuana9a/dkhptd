/* eslint-disable no-param-reassign */
export default (propName: string, toNewValue = (oldValue): unknown => oldValue) => (input) => {
  const oldValue = input[propName];
  input[propName] = toNewValue(oldValue);
  return input;
};
