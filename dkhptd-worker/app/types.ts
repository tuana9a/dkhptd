import { Job } from "puppeteer-worker-job-builder";

export type JobSupplier = () => Job;

export type JobInfo = {
  name: string;
  params: object;
}