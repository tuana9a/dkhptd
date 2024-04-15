export class SafeError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidJobInfoError extends SafeError {
  constructor(which) {
    super(`Invalid job info: ${which}`);
  }
}

export class InvalidWorkerTypeError extends SafeError {
  constructor(which) {
    super(`Invalid worker type: ${which}`);
  }
}

export class JobDirNotExistsError extends SafeError {
  constructor(dir) {
    super(`Job dir "${dir}" not exists`);
  }
}

export class JobNotFoundError extends SafeError {
  constructor(name) {
    super(`Job "${name}" not found`);
  }
}

export class PuppeteerDisconnectedError extends SafeError {
  constructor() {
    super("PUPPETEER_DISCONNECTED");
  }
}

export class ScheduleDirNotExistsError extends SafeError {
  constructor(dir: string) {
    super(`Schedule dir "${dir}" not exists`);
  }
}
