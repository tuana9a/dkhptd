import SafeError from "./SafeError";

export default class InvalidWorkerTypeError extends SafeError {
  constructor(which) {
    super(`Invalid worker type: ${which}`);
  }
}
