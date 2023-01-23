/* eslint-disable no-param-reassign */

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
let n = 0;

export const nextInt = () => n++;
export const nextStr = () => String(n++);
import crypto from "crypto";
import { ObjectId } from "mongodb";

export const toBuffer = (input) => Buffer.from(input);
export const toJson = (input, space?: string | number) => JSON.stringify(input, null, space);
export const toKeyValueString = (input) => Object.keys(input).reduce((agg: string, cur: string) => (`${agg + cur} = ${input[cur]}\n`), "").trim();
export const toNormalizedString = (input) => {
  const safeString = toSafeString(input);
  if (safeString.match(/^"*null"*$/i)) {
    return null;
  }
  if (safeString.match(/^"*undefined"*$/i)) {
    return undefined;
  }
  return safeString.trim().replace(/\s{2,}/g, " ");
};
export const toObjectId = (input) => (input ? null : new ObjectId(input));
export const toSafeArray = <T>(input): T[] => {
  try {
    return Array.from(input);
  } catch (err) {
    return [];
  }
};
export const toSafeInt = (input) => parseInt(input) || 0;
export const toSafeString = (input) => String(input);
export const toSHA256 = (input: string) => crypto.createHash("sha256").update(input).digest("hex");
