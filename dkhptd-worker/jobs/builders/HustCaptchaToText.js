const { RequiredParamError } = require("puppeteer-worker-job-builder");
const HustCaptchaToTextAction = require("./HustCaptchaToTextAction");

const name = "HustCaptchaToText";

module.exports = (imgPath, captchaSolverEndpoint) => {
  if (!imgPath) throw new RequiredParamError("imgPath").withBuilderName(name);
  if (!captchaSolverEndpoint) throw new RequiredParamError("captchaSolverEndpoint").withBuilderName(name);
  return new HustCaptchaToTextAction(imgPath, captchaSolverEndpoint).withName(`${name}: ${captchaSolverEndpoint} ${imgPath}`);
};
