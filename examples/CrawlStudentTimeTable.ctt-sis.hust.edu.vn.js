const {
  Job,
  Action,
  ActionPayload,
  BringToFront,
  GoTo,
  WaitForTimeout,
  BreakPoint,
  GetActionOutput,
  ScreenShot,
  TypeIn,
  RepeatUntil,
  Click,
  GetValueFromParams,
  CurrentUrl,
  GetTextContent,
  PageEval,
  RequiredParamError,
} = require("puppeteer-worker-job-builder/v1");

const BASE_URL = "https://ctt-sis.hust.edu.vn";
const LOGIN_URL = `${BASE_URL}/Account/Login.aspx`;
const LOGOUT_URL = `${BASE_URL}/Account/Logout.aspx`;
const STUDENT_PROGRAM_URL = `${BASE_URL}/Students/StudentProgram.aspx`;
const STUDENT_TIMETABLE_URL = `${BASE_URL}/Students/Timetables.aspx`;

const SAVE_CAPTCHA_TO = "./tmp/temp.png";
const MAX_TRY_CAPTCHA_COUNT = 10;

function HustCaptchaToText(imgPath, captchaSolverEndpoint) {
  if (!imgPath) throw new RequiredParamError("imgPath").withBuilderName(HustCaptchaToText.name);
  if (!captchaSolverEndpoint) throw new RequiredParamError("captchaSolverEndpoint").withBuilderName(HustCaptchaToText.name);

  return new Action(HustCaptchaToText.name, async (_payload) => {
    const payload = ActionPayload.from(_payload);
    const { libs } = payload;
    const { fs, axios, FormData } = libs;
    const form = new FormData();
    form.append("file", fs.createReadStream(imgPath));
    try {
      const predictResult = await axios
        .post(captchaSolverEndpoint, form, { headers: form.getHeaders() })
        .then((res) => String(res.data).trim());
      return predictResult;
    } catch (err) {
      return err.message;
    }
  });
}

const crawlTimeTable = () => {
  // note: browser scope not nodejs scope
  const $table = "#ctl00_ctl00_contentPane_MainPanel_MainContent_gvStudentRegister_DXMainTable";
  // eslint-disable-next-line no-undef
  const table = document.querySelector($table);
  const rows = table.querySelectorAll(".dxgvDataRow_Mulberry");
  const result = Array.from(rows).map((row) => {
    const values = Array.from(row.querySelectorAll(".dxgv"))
      .map((col) => col.textContent)
      .map((col) => col.trim().replace(/\s{2,}/g, " "));
    return {
      ThoiGianHoc: values[0],
      HocVaoCacTuan: values[1],
      PhongHoc: values[2],
      MaLop: values[3],
      LoaiLop: values[4],
      Nhom: values[5],
      MaHocPhan: values[6],
      TenHocPhan: values[7],
      GhiChu: values[8],
    };
  });
  return result;
};

module.exports = new Job({
  name: "CrawlStudentTimeTable",
  actions: [
    BringToFront(),
    GoTo(LOGIN_URL),
    WaitForTimeout(1000),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_rblAccountType_RB0"),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", { clickCount: 3 }),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", GetValueFromParams((params) => params.username)),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbPassword_I_CLND", GetValueFromParams((params) => params.password)),
    ScreenShot("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_IMG", SAVE_CAPTCHA_TO, "png"),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_I", HustCaptchaToText(SAVE_CAPTCHA_TO, "http://localhost:8000")),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_btLogin_CD"),
    WaitForTimeout(3000),
    BreakPoint(CurrentUrl(), (currentUrl) => currentUrl === LOGIN_URL/* van o trang dang nhap */, [
      GetTextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_FailureText"), // sai tai khoan
      GetTextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_EC"), // sai captcha
    ]),
    GoTo(STUDENT_TIMETABLE_URL),
    PageEval(crawlTimeTable),
    GoTo(LOGOUT_URL),
    BreakPoint(CurrentUrl(), () => true),
  ],
});
