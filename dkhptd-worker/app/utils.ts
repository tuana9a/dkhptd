export const toBuffer = (input: string) => Buffer.from(input);
export const toJson = (input, space = 0) => JSON.stringify(input, null, space);
export const toPrettyErr = (err: Error) => ({
  name: err.name,
  message: err.message,
  stack: err.stack.split("\n"),
});
/* eslint-disable no-param-reassign */

export const update = (origin, target) => {
  if (target) {
    for (const key of Object.keys(origin)) {
      const newValue = target[key];
      if (newValue !== undefined && newValue !== null) {
        origin[key] = newValue;
      }
    }
  }
  return origin;
};
