class InvalidWorkerTypeError extends Error {
  constructor(which) {
    super(`Invalid worker type: ${which}`);
  }
}

module.exports = InvalidWorkerTypeError;
