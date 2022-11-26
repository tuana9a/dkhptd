import SafeError from "./SafeError";

export default class EmptyStringError extends SafeError {
  path: string;
  value;

  constructor(name: string, value) {
    super("EMPTY_STRING");
    this.path = name;
    this.value = value;
  }
}