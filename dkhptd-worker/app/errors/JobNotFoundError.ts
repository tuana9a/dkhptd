import SafeError from "./SafeError";

export default class JobNotFoundError extends SafeError {
  constructor(name) {
    super(`Job "${name}" not found`);
  }
}
