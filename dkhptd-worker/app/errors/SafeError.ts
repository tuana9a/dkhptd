export default class SafeError extends Error {
  constructor(message: string) {
    super(message);
  }
}