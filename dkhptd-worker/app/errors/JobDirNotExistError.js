class JobDirNotExistsError extends Error {
  constructor(dir) {
    super(`Job dir "${dir}" not exists`);
  }
}

module.exports = JobDirNotExistsError;
