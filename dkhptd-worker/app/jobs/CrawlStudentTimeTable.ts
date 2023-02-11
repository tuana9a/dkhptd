import { BringToFront, GoTo, WaitForTimeout, ScreenShot, TypeIn, Click, GetValueFromParams, CurrentUrl, GetTextContent, PageEval, If, IsEqual, Job, Break, SetVars } from "puppeteer-worker-job-builder";
import { ResolveCaptcha } from "../job-builders";

const LOGIN_URL = "https://ctt-sis.hust.edu.vn/Account/Login.aspx";
const LOGOUT_URL = "https://ctt-sis.hust.edu.vn/Account/Logout.aspx";
const STUDENT_TIMETABLE_URL = "https://ctt-sis.hust.edu.vn/Students/Timetables.aspx";
const SAVE_CAPTCHA_TO = "./tmp/temp.png";

const CrawlTimeTableHandler = () => {// browser scope not nodejs scope
  // eslint-disable-next-line no-undef
  const table = document.querySelector("#ctl00_ctl00_contentPane_MainPanel_MainContent_gvStudentRegister_DXMainTable");
  const tkb = [];
  table.querySelectorAll(".dxgvDataRow_Mulberry").forEach((row) => {
    const values = [];
    row.querySelectorAll(".dxgv").forEach(cell => cell.textContent.trim().replace(/\s{2,}/g, " "));
    tkb.push({
      ThoiGianHoc: values[0],
      HocVaoCacTuan: values[1],
      PhongHoc: values[2],
      MaLop: values[3],
      LoaiLop: values[4],
      Nhom: values[5],
      MaHocPhan: values[6],
      TenHocPhan: values[7],
      GhiChu: values[8],
    });
  });
  return tkb;
};

export default () => new Job({
  name: "CrawlStudentTimeTable",
  actions: [
    BringToFront(),
    GoTo(LOGIN_URL),
    WaitForTimeout(1000),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_rblAccountType_RB0"),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", { clickCount: 3 }),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", GetValueFromParams((p) => p.username)),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbPassword_I_CLND", GetValueFromParams((p) => p.password)),
    ScreenShot("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_IMG", SAVE_CAPTCHA_TO, "png"),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_I", ResolveCaptcha(SAVE_CAPTCHA_TO, "https://hcr.tuana9a.com")),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_btLogin_CD"),
    WaitForTimeout(3000),
    If(IsEqual(CurrentUrl(), LOGIN_URL /* van o trang dang nhap */)).Then([
      GetTextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_FailureText"), /* sai tai khoan */
      GetTextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_EC"), /* sai captcha */
      Break(),
    ]),
    GoTo(STUDENT_TIMETABLE_URL),
    SetVars("studentTimeTable", PageEval(CrawlTimeTableHandler)),
    GoTo(LOGOUT_URL),
    Break(),
  ],
});
