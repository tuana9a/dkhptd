import { Action } from "puppeteer-worker-job-builder";

export class _HustCaptchaToText extends Action {
  imgPath: string;
  endPoint: string;

  constructor(imgPath: string, endpoint: string) {
    super(_HustCaptchaToText.name);
    this.imgPath = imgPath;
    this.endPoint = endpoint;
  }

  async run() {
    try {
      const { fs, axios, FormData } = this.__context.libs;
      const form = new FormData();
      form.append("file", fs.createReadStream(this.imgPath));
      const predict = await axios
        .post(this.endPoint, form, { headers: form.getHeaders() })
        .then((res) => String(res.data));
      return predict;
    } catch (err) {
      return err.message;
    }
  }
}
