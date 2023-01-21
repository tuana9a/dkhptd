import { BringToFront, GoTo, WaitForTimeout, SetVars, ScreenShot, TypeIn, Click, GetValueFromParams, CurrentUrl, GetTextContent, PageEval, If, IsEqual, Job, Break } from "puppeteer-worker-job-builder";
import { HustCaptchaToText } from "../job-builders";

const LOGIN_URL = "https://ctt-sis.hust.edu.vn/Account/Login.aspx";
const LOGOUT_URL = "https://ctt-sis.hust.edu.vn/Account/Logout.aspx";
const STUDENT_PROGRAM_URL = "https://ctt-sis.hust.edu.vn/Students/StudentProgram.aspx";
const SAVE_CAPTCHA_TO = "./tmp/temp.png";

const CrawlStudentProgramHandler = () => {
  // note: browser scope not nodejs scope
  const selector = "#ctl00_ctl00_contentPane_MainPanel_MainContent_ProgramCoursePanel_gvStudentProgram_DXMainTable";
  // eslint-disable-next-line no-undef
  const table = document.querySelector(selector);
  if (table) {
    const courses = [];
    table.querySelectorAll(".dxgvDataRow").forEach((row) => {
      const cells = [];
      row.querySelectorAll(".dxgv").forEach(cell => {
        cells.push(cell.textContent.trim().replace(/\s{2,}/g, " "));
      });
      courses.push({
        MaHocPhan: cells[2],
        TenHocPhan: cells[3],
        KyHoc: cells[4],
        BatBuoc: cells[5],
        TinChiDaoTao: cells[6],
        TinChiHoc: cells[7],
        MaHocPhanHoc: cells[8],
        LoaiHocPhan: cells[9],
        DiemChu: cells[10],
        DiemSo: cells[11],
        KhoaVien: cells[12],
      });
    });
    return courses;
  }
};

export default () => new Job({
  name: "CrawlStudentProgram",
  actions: [
    BringToFront(),
    GoTo(LOGIN_URL),
    WaitForTimeout(1000),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_rblAccountType_RB0"),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", { clickCount: 3 }),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", GetValueFromParams((p) => p.username)),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbPassword_I_CLND", GetValueFromParams((p) => p.password)),
    ScreenShot("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_IMG", SAVE_CAPTCHA_TO, "png"),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_I", HustCaptchaToText(SAVE_CAPTCHA_TO, "https://hcr.tuana9a.com")),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_btLogin_CD"),
    WaitForTimeout(3000),
    If(IsEqual(CurrentUrl(), LOGIN_URL /* van o trang dang nhap */)).Then([
      SetVars("userError", GetTextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_FailureText")/* sai tai khoan */),
      SetVars("catpchaError", GetTextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_EC") /* sai captcha */),
      SetVars("studentProgram", PageEval(CrawlStudentProgramHandler)),
      Break(),
    ]).Else([
      GoTo(STUDENT_PROGRAM_URL),
      SetVars("studentProgram", PageEval(CrawlStudentProgramHandler)),
      GoTo(LOGOUT_URL),
      Break(),
    ]),
  ],
});
