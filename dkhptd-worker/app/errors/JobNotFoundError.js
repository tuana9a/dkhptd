class JobNotFoundError extends Error {
  constructor(name) {
    super(`Job "${name}" not found`);
  }
}

module.exports = JobNotFoundError;
