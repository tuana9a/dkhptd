import SafeError from "./SafeError";

export default class JobDirNotExistsError extends SafeError {
  constructor(dir) {
    super(`Job dir "${dir}" not exists`);
  }
}
