import { Page } from "puppeteer-core";

export class Context {
  workDir: string;
  page: Page;
  libs;
  utils;
  params;
  vars;
  isFatalError: boolean;
  logs: { msg: string, data?: any }[];
  onDoing: (info: DoingInfo) => unknown;

  constructor(o: {
    workDir: string;
    page: Page;
    libs;
    utils;
    params;
    vars?;
    onDoing?: (info: DoingInfo) => unknown;
  }) {
    this.workDir = o.workDir;
    this.page = o.page;
    this.libs = o.libs;
    this.utils = o.utils;
    this.params = o.params;
    this.vars = o.vars || {};
    this.logs = [];
    this.onDoing = o.onDoing || (() => null);
  }
}

export type Job = (context: Context) => Promise<Context>;

export interface JobRequest {
  id: string;
  name: string;
  username: string;
  password: string;
  classIds: string[];
}

export interface DoingInfo {
  msg: string;
  at: number;
}
