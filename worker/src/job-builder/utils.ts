import { PrettyError } from "./types";

export function nullify(object) {
  const keys = Object.keys(object);
  for (const key of keys) {
    // eslint-disable-next-line no-param-reassign
    object[key] = null;
  }
}

export function toPrettyErr(err: Error): PrettyError {
  return {
    name: err.name,
    message: err.message,
    stack: err.stack.split("\n"),
  };
}