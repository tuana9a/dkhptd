import toSafeInt from "../utils/toSafeInt";

/* eslint-disable no-param-reassign */
export default (propName: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = toSafeInt(input[propName]);
  return input;
};
