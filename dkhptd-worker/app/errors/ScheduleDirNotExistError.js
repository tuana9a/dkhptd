class ScheduleDirNotExistsError extends Error {
  constructor(dir) {
    super(`Schedule dir "${dir}" not exists`);
  }
}

module.exports = ScheduleDirNotExistsError;
