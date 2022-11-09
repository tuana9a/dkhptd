/* eslint-disable no-param-reassign */
export default (key: string, value: unknown) => (input) => {
  input[key] = value;
  return input;
};
