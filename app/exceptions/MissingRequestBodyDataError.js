class MissingRequestBodyDataError extends Error {
  constructor() {
    super("MISSING_REQUEST_BODY_DATA");
  }
}

module.exports = MissingRequestBodyDataError;
