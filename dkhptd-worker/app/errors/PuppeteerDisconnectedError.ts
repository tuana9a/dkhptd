import SafeError from "./SafeError";

export default class PuppeteerDisconnectedError extends SafeError {
  constructor() {
    super("PUPPETEER_DISCONNECTED");
  }
}
