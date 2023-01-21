import { RequiredParamError } from "puppeteer-worker-job-builder";
import { _HustCaptchaToText } from "./actions";

export const HustCaptchaToText = (imgPath: string, endpoint: string) => {
  if (!imgPath) throw new RequiredParamError("imgPath").withBuilderName(HustCaptchaToText.name);
  if (!endpoint) throw new RequiredParamError("endpoint").withBuilderName(HustCaptchaToText.name);
  return new _HustCaptchaToText(imgPath, endpoint).withName(`${HustCaptchaToText.name}: ${endpoint} ${imgPath}`);
};
