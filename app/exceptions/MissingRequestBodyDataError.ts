import SafeError from "./SafeError";

export default class MissingRequestBodyDataError extends SafeError {
  constructor() {
    super("MISSING_REQUEST_BODY_DATA");
  }
}
