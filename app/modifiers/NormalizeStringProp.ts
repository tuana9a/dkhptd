import toNormalizedString from "../dto/toNormalizedString";

/* eslint-disable no-param-reassign */
export default (propName: string) => (input: any) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = toNormalizedString(input[propName]);

  return input;
};
