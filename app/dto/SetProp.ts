/* eslint-disable no-param-reassign */
export default (key: string, value: any) => (input: any) => {
  input[key] = value;
  return input;
};
