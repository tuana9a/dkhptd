export const modify = (input, chains: ((...args) => unknown)[]) => {
  let output = input;
  for (const modifier of chains) {
    output = modifier(output);
  }
  return output;
};

export const drop = (propNames: string[] = []) => (input) => {
  const output = {};

  const remainKeys = Object.keys(input).filter((key) => !propNames.includes(key));

  for (const propName of remainKeys) {
    output[propName] = input[propName];
  }

  return output;
};

export const normalizeArray = (propName: string, propType?: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined || !Array.isArray(currentValue)) {
    input[propName] = []; // default for an array;
    return input;
  }

  if (propType === "int") {
    input[propName] = input[propName].map((x) => parseInt(x) || 0);
    return input;
  }

  if (propType === "string") {
    input[propName] = input[propName].map((x) => String(x));
    return input;
  }

  // other type do nothing
  return input;
};

export const normalizeInt = (propName: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = parseInt(input[propName]) || 0;
  return input;
};

export const normalizeString = (propName: string) => (input) => {
  const currentValue = input[propName];

  if (currentValue === null || currentValue === undefined) {
    return input;
  }

  input[propName] = String(input[propName]).trim().replace(/\s{2,}/g, " ");

  return input;
};

export const pick = (propNames: string[] = [], options = { dropFalsy: false }) => (input) => {
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

export const replace = (propName: string, toNewValue = (oldValue): unknown => oldValue) => (input) => {
  const oldValue = input[propName];
  input[propName] = toNewValue(oldValue);
  return input;
};

export const set = (key: string, value: unknown) => (input) => {
  input[key] = value;
  return input;
};

export const m = {
  drop: drop,
  normalizeArray: normalizeArray,
  normalizeInt: normalizeInt,
  normalizeString: normalizeString,
  pick: pick,
  replace: replace,
  set: set,
};
