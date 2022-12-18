import SafeError from "./SafeError";

export default class InvalidJobInfoError extends SafeError {
  constructor(which) {
    super(`Invalid job info: ${which}`);
  }
}
