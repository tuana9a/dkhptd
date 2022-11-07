/* eslint-disable no-param-reassign */
export default (propName: string, toNewValue = (oldValue: any): any => oldValue) => (input: any) => {
  const oldValue = input[propName];
  input[propName] = toNewValue(oldValue);
  return input;
};
