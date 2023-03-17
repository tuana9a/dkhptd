import {
  BringToFront,
  GoTo,
  WaitForTimeout,
  ScreenShot,
  TypeIn,
  Click,
  CurrentUrl,
  PageEval,
  If,
  IsEqual,
  For,
  Job,
  Break,
  Try,
  SetVars,
  Reload,
  Params,
  TextContent,
  Action,
  RequiredParamError,
} from "puppeteer-worker-job-builder";

const toPrettyErr = (err: Error) => ({
  name: err.name,
  message: err.message,
  stack: err.stack.split("\n"),
});

class ResolveCaptchaAction extends Action {
  imgPath: string;
  endPoint: string;

  constructor(imgPath: string, endpoint: string) {
    super(ResolveCaptchaAction.name);
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

const ResolveCaptcha = (imgPath: string, endpoint: string) => {
  if (!imgPath) throw new RequiredParamError("imgPath").withBuilderName(ResolveCaptcha.name);
  if (!endpoint) throw new RequiredParamError("endpoint").withBuilderName(ResolveCaptcha.name);
  return new ResolveCaptchaAction(imgPath, endpoint).withName(`${ResolveCaptcha.name}: ${endpoint} ${imgPath}`);
};

const CrawlRegisterResultHandler = () => { // browser scope not nodejs scop
  // eslint-disable-next-line no-undef
  const table = document.getElementById("ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_gvRegisteredList_DXMainTable");
  // lấy data html đăng kí lớp
  const registerResult = [];
  table.querySelectorAll("tr.dxgvDataRow_Moderno").forEach((row) => {
    const cells = [];
    row.querySelectorAll("td").forEach(cell => cells.push(cell.textContent.trim().replace(/\s{2,}/g, " ")));
    registerResult.push({
      MaLop: cells[0],
      MaLopKem: cells[1],
      TenLop: cells[2],
      MaHocPhan: cells[3],
      LoaiLop: cells[4],
      TrangThaiLop: cells[5],
      YeuCau: cells[6],
      TrangThaiDangKy: cells[7],
      LoaiDangKy: cells[8],
      ThucHien: cells[9],
      TinChi: cells[10],
    });
  });
  return registerResult;
};

export default () => new Job({
  name: "DangKyHocPhanTuDongV1",
  actions: [
    BringToFront(),
    Try([
      GoTo("https://dk-sis.hust.edu.vn/Users/Login.aspx"),
      WaitForTimeout(3000),
      Reload(),
      Click("#tbUserName", { clickCount: 3 }),
      TypeIn("#tbUserName", Params((p) => p.username)),
      TypeIn("#tbPassword_CLND", Params("password")),
      ScreenShot("#ccCaptcha_IMG", "./tmp/temp.png", "png"),
      TypeIn("#ccCaptcha_TB_I", ResolveCaptcha("./tmp/temp.png", "https://hcr.tuana9a.com")),
      Click("button"),
      WaitForTimeout(3000),
      // must be https://dk-sis.hust.edu.vn/ not https://dk-sis.hust.edu.vn
      // current url will return with '/' at the end
      If(IsEqual(CurrentUrl(), "https://dk-sis.hust.edu.vn/Users/Login.aspx")).Then([
        /* van o trang dang nhap */
        SetVars("userError", TextContent("#lbStatus")), //sai tai khoan
        SetVars("captchaError", TextContent("#ccCaptcha_TB_EC")), //sai captcha
        Break(),
      ]),
      For(Params("classIds")).Each([
        Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", { clickCount: 3 }),
        (classId) => TypeIn("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", classId),
        /* gui dang ky 1 lop */
        Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btDirectClassRegister_CD"),
        WaitForTimeout(1000),
        /* xem tin nhan tra ve */
        (classId) => SetVars(`registerMessages.classId-${classId}`, TextContent("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_lbKQ"))
      ]),
      /* gui tat ca dang ky */
      Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btSendRegister_CD"),
      WaitForTimeout(1000),
      /* xac nhan gui dang ky */
      Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_pcYesNo_pcYesNoBody1_ASPxRoundPanel1_btnYes"),
      WaitForTimeout(1000),
      SetVars("registerResult", PageEval(CrawlRegisterResultHandler)),
      GoTo("https://dk-sis.hust.edu.vn/Users/Logout.aspx"),
    ]).Catch([
      err => SetVars("systemError", toPrettyErr(err))
    ]),
  ],
});
