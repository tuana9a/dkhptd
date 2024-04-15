import { Browser } from "puppeteer-core";
import { Context, Job, runContext, DoingInfo } from "./job-builder";

export class PuppeteerWorker {
  constructor(private browser?: Browser) { }

  setBrowser(browser: Browser) {
    this.browser = browser;
  }

  getBrowser() {
    return this.browser;
  }

  async getPage(index: number) {
    const pages = await this.browser.pages();
    return pages[index];
  }

  async getFirstPage() {
    return this.getPage(0);
  }

  async do(job: Job, opts: { pageIndex?: number; onDoing?: (info: DoingInfo) => unknown } = { pageIndex: 0, onDoing: () => null }) {
    const page = await this.getPage(opts?.pageIndex || 0);
    const rootContext = new Context({
      job: job.name,
      page: page,
      libs: job.libs,
      params: job.params,
      currentStepIdx: 0,
      currentNestingLevel: 0,
      isBreak: false,
      logs: [],
      runContext: runContext,
      stacks: Array.from(job.actions).reverse(),
      onDoing: opts?.onDoing,
    });
    await runContext(rootContext);
    return rootContext;
  }
}
