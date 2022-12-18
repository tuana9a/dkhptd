import puppeteer from "puppeteer";
import { Component } from "tu9nioc";
import config from "../config";

@Component("puppeteerClient", { ignoreDeps: ["browser"] })
export default class PuppeteerClient {
  constructor(private browser: puppeteer.Browser) { }

  async launch() {
    this.browser = await puppeteer.launch(config.puppeteerLaunchOption);
    return this;
  }

  onDisconnect(handler: () => unknown) {
    this.browser.on("disconnected", handler);
    return this;
  }

  getBrowser() {
    return this.browser;
  }

  async getPageByIndex(index: number) {
    const pages = await this.browser.pages();
    return pages[index];
  }

  async getFirstPage() {
    return this.getPageByIndex(0);
  }
}
