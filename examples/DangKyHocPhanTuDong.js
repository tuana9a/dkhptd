const {
  BringToFront,
  GoTo,
  WaitForTimeout,
  BreakPoint,
  ScreenShot,
  TypeIn,
  Click,
  GetValueFromParams,
  CurrentUrl,
  GetTextContent,
  PageEval,
  If,
  IsEqual,
  For,
  Job,
  Action,
  RequiredParamError,
} = require("puppeteer-worker-job-builder/v1");

const LOGIN_URL = "http://dk-sis.hust.edu.vn/Users/Login.aspx";
const LOGOUT_URL = "http://dk-sis.hust.edu.vn/Users/Logout.aspx";
const SAVE_CAPTCHA_TO = "./tmp/temp.png";

class HustCaptchaToTextAction extends Action {
  constructor(imgPath, captchaSolverEndpoint) {
    super(HustCaptchaToTextAction.name);
    this.imgPath = imgPath;
    this.captchaSolverEndpoint = captchaSolverEndpoint;
  }

  async run() {
    const { fs, axios, FormData } = this.libs;
    const form = new FormData();
    form.append("file", fs.createReadStream(this.imgPath));
    try {
      const predictResult = await axios
        .post(this.captchaSolverEndpoint, form, { headers: form.getHeaders() })
        .then((res) => String(res.data).trim());
      return predictResult;
    } catch (err) {
      return err.message;
    }
  }
}

function HustCaptchaToText(imgPath, captchaSolverEndpoint) {
  if (!imgPath) throw new RequiredParamError("imgPath").withBuilderName(HustCaptchaToText.name);
  if (!captchaSolverEndpoint) throw new RequiredParamError("captchaSolverEndpoint").withBuilderName(HustCaptchaToText.name);
  return new HustCaptchaToTextAction(imgPath, captchaSolverEndpoint).withName(`${HustCaptchaToText.name}: ${captchaSolverEndpoint} ${imgPath}`);
}

const CrawlRegisterResultHandler = () => {
  // note: browser scope not nodejs scop
  const $table = "ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_gvRegisteredList_DXMainTable";
  // eslint-disable-next-line no-undef
  const table = document.getElementById($table);
  // lấy data html đăng kí lớp
  const rows = Array.from(table.querySelectorAll("tr.dxgvDataRow_Moderno"));
  return rows.map((row) => {
    const values = Array.from(row.querySelectorAll("td"))
      .map((e) => e.textContent)
      .map((col) => col.trim().replace(/\s{2,}/g, " "));
    return {
      MaLop: values[0],
      MaLopKem: values[1],
      TenLop: values[2],
      MaHocPhan: values[3],
      LoaiLop: values[4],
      TrangThaiLop: values[5],
      YeuCau: values[6],
      TrangThaiDangKy: values[7],
      LoaiDangKy: values[8],
      ThucHien: values[9],
      TinChi: values[10],
    };
  });
};

module.exports = ({ libs, params, page }) => new Job({
  name: "DangKyHocPhanTuDong",
  libs: libs,
  params: params,
  page: page,
  actions: [
    BringToFront(),
    GoTo(LOGIN_URL),
    WaitForTimeout(1000),
    Click("#tbUserName", { clickCount: 3 }),
    TypeIn("#tbUserName", GetValueFromParams((p) => p.username)),
    TypeIn("#tbPassword_CLND", GetValueFromParams((p) => p.password)),
    ScreenShot("#ccCaptcha_IMG", SAVE_CAPTCHA_TO, "png"),
    TypeIn("#ccCaptcha_TB_I", HustCaptchaToText(SAVE_CAPTCHA_TO, "http://localhost:8000")),
    Click("button"),
    WaitForTimeout(3000),
    If(IsEqual(CurrentUrl(), LOGIN_URL /* van o trang dang nhap */)).Then([
      GetTextContent("#lbStatus"), // sai tai khoan
      GetTextContent("#ccCaptcha_TB_EC"), // sai captcha
      BreakPoint(),
    ]),
    For(GetValueFromParams((x) => x.classIds)).Each([
      Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", { clickCount: 3 }),
      (classId) => TypeIn("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", classId),
      /* gui dang ky 1 lop */
      Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btDirectClassRegister_CD"),
      WaitForTimeout(1000),
      /* xem tin nhan tra ve */
      GetTextContent("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_lbKQ"),
    ]),
    /* gui tat ca dang ky */
    Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btSendRegister_CD"),
    WaitForTimeout(1000),
    /* xac nhan gui dang ky */
    Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_pcYesNo_pcYesNoBody1_ASPxRoundPanel1_btnYes"),
    PageEval(CrawlRegisterResultHandler),
    GoTo(LOGOUT_URL),
    BreakPoint(),
  ],
});
