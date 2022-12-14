class InvalidJobInfoError extends Error {
  constructor(which) {
    super(`Invalid job info: ${which}`);
  }
}

module.exports = InvalidJobInfoError;
