import SafeError from "./SafeError";

export default class ScheduleDirNotExistsError extends SafeError {
  constructor(dir: string) {
    super(`Schedule dir "${dir}" not exists`);
  }
}
