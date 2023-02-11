import { RequiredParamError } from "puppeteer-worker-job-builder";
import { ResolveCaptchaAction } from "./actions";

export const ResolveCaptcha = (imgPath: string, endpoint: string) => {
  if (!imgPath) throw new RequiredParamError("imgPath").withBuilderName(ResolveCaptcha.name);
  if (!endpoint) throw new RequiredParamError("endpoint").withBuilderName(ResolveCaptcha.name);
  return new ResolveCaptchaAction(imgPath, endpoint).withName(`${ResolveCaptcha.name}: ${endpoint} ${imgPath}`);
};
