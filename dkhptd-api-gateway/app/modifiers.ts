/* eslint-disable no-param-reassign */

import { toSafeInt, toSafeString, toNormalizedString } from "./to";

export const modify = (input, chains: ((...args) => unknown)[]) => {
  let output = input;
  for (const modifier of chains) {
    output = modifier(output);
  }
  return output;
};

export const DropProps = (propNames: string[] = []) => (input) => {
  const output = {};

  const remainKeys = Object.keys(input).filter((key) => !propNames.includes(key));

  for (const propName of remainKeys) {
    output[propName] = input[propName];
  }

  return output;
};

export const NormalizeArrayProp = (propName: string, propType?: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined || !Array.isArray(currentValue)) {
    input[propName] = []; // default for an array;
    return input;
  }

  if (propType === "int") {
    input[propName] = input[propName].map((x) => toSafeInt(x));
    return input;
  }

  if (propType === "string") {
    input[propName] = input[propName].map((x) => toSafeString(x));
    return input;
  }

  // other type do nothing
  return input;
};

export const NormalizeIntProp = (propName: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = toSafeInt(input[propName]);
  return input;
};

export const NormalizeStringProp = (propName: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = toNormalizedString(input[propName]);

  return input;
};

export const PickProps = (propNames: string[] = [], options = { dropFalsy: false }) => (input) => {
  const output = {};

  for (const propName of propNames) {
    if (options?.dropFalsy) {
      if (input[propName]) { // check not falsy value
        output[propName] = input[propName];
      }
    } else {
      output[propName] = input[propName];
    }
  }

  return output;
};

export const ReplaceCurrentPropValueWith = (propName: string, toNewValue = (oldValue): unknown => oldValue) => (input) => {
  const oldValue = input[propName];
  input[propName] = toNewValue(oldValue);
  return input;
};

export const SetProp = (key: string, value: unknown) => (input) => {
  input[key] = value;
  return input;
};
