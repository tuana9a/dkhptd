import { BringToFront, GoTo, WaitForTimeout, ScreenShot, TypeIn, Click, GetValueFromParams, CurrentUrl, GetTextContent, PageEval, If, IsEqual, For, Job, Break, SetVars, Try } from "puppeteer-worker-job-builder";
import { HustCaptchaToText } from "../job-builders";
import { toPrettyErr } from "../utils";

const CrawlRegisterResultHandler = () => {
  // note: browser scope not nodejs scop
  // eslint-disable-next-line no-undef
  const table = document.getElementById("ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_gvRegisteredList_DXMainTable");
  // lấy data html đăng kí lớp
  const rows = table.querySelectorAll("tr.dxgvDataRow_Moderno");
  const classes = [];
  rows.forEach(row => {
    const cells = [];
    row.querySelectorAll("td").forEach((cell: Element) => {
      const text = String(cell.textContent).trim().replace(/\s{2,}/g, " ");
      cells.push(text);
    });
    classes.push({
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
  return classes;
};

export default () => new Job({
  name: "DangKyHocPhanTuDong",
  actions: [
    BringToFront(),
    Try([
      GoTo("http://dk-sis.hust.edu.vn/"),
      WaitForTimeout(1000),
      Click("#tbUserName", { clickCount: 3 }),
      TypeIn("#tbUserName", GetValueFromParams((p) => p.username)),
      TypeIn("#tbPassword_CLND", GetValueFromParams((p) => p.password)),
      ScreenShot("#ccCaptcha_IMG", "./tmp/temp.png", "png"),
      TypeIn("#ccCaptcha_TB_I", HustCaptchaToText("./tmp/temp.png", "https://hcr.tuana9a.com")),
      Click("button"),
      WaitForTimeout(3000),
      If(IsEqual(CurrentUrl(), "http://dk-sis.hust.edu.vn/" /* van o trang dang nhap */)).Then([
        SetVars("userError", GetTextContent("#lbStatus") /*sai tai khoan*/),
        SetVars("captchaError", GetTextContent("#ccCaptcha_TB_EC") /*sai captcha*/),
        Break(),
      ]),
      If(IsEqual(CurrentUrl(), "http://www.dk-sis.hust.edu.vn/" /* van o trang dang nhap */)).Then([
        SetVars("userError", GetTextContent("#lbStatus") /*sai tai khoan*/),
        SetVars("captchaError", GetTextContent("#ccCaptcha_TB_EC") /*sai captcha*/),
        Break(),
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
      SetVars("registerResult", PageEval(CrawlRegisterResultHandler)),
      GoTo("http://dk-sis.hust.edu.vn/Users/Logout.aspx"),
    ]).Catch([
      err => SetVars("systemError", toPrettyErr(err)),
    ]),
  ],
});