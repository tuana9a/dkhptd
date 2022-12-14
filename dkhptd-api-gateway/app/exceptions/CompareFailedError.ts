import SafeError from "./SafeError";

export default class CompareFailedError extends SafeError {
  value;

  comparator;

  path;

  constructor(name: string, value, comparator) {
    super("COMPARE_FAILED");
    this.path = name;
    this.value = value;
    this.comparator = comparator;
  }
}