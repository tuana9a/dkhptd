const { Action } = require("puppeteer-worker-job-builder");

class HustCaptchaToTextAction extends Action {
  constructor(imgPath, captchaSolverEndpoint) {
    super(HustCaptchaToTextAction.name);
    this.imgPath = imgPath;
    this.captchaSolverEndpoint = captchaSolverEndpoint;
  }

  async run() {
    const { fs, axios, FormData } = this.__context.libs;
    const form = new FormData();
    form.append("file", fs.createReadStream(this.imgPath));
    try {
      const predict = await axios
        .post(this.captchaSolverEndpoint, form, { headers: form.getHeaders() })
        .then((res) => String(res.data).trim());
      return predict;
    } catch (err) {
      return err.message;
    }
  }
}

module.exports = HustCaptchaToTextAction;
