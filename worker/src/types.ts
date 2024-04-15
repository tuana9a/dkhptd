import { Job } from "./job-builder";

export type JobSupplier = () => Job;

export interface JobRequest {
  id: string;
  name: string;
  username: string;
  password: string;
  classIds: string[];
}