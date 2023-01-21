import { BringToFront, GoTo, WaitForTimeout, ScreenShot, TypeIn, Click, GetValueFromParams, CurrentUrl, GetTextContent, PageEval, If, IsEqual, For, Job, Break, Try, SetVars } from "puppeteer-worker-job-builder";
import { HustCaptchaToText } from "../job-builders";
import { toPrettyErr } from "../utils";

const CrawlRegisterResultHandler = () => { // browser scope not nodejs scop
  // eslint-disable-next-line no-undef
  const table = document.getElementById("ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_gvRegisteredList_DXMainTable");
  // lấy data html đăng kí lớp
  const registerResult = [];
  table.querySelectorAll("tr.dxgvDataRow_Moderno").forEach((row) => {
    const values = [];
    row.querySelectorAll("td").forEach(cell => cell.textContent.trim().replace(/\s{2,}/g, " "));
    registerResult.push({
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
    });
  });
  return registerResult;
};

export default () => new Job({
  name: "DangKyHocPhanTuDongV1",
  actions: [
    BringToFront(),
    Try([
      GoTo("https://dk-sis.hust.edu.vn/"),
      WaitForTimeout(1000),
      Click("#tbUserName", { clickCount: 3 }),
      TypeIn("#tbUserName", GetValueFromParams((p) => p.username)),
      TypeIn("#tbPassword_CLND", GetValueFromParams((p) => p.password)),
      ScreenShot("#ccCaptcha_IMG", "./tmp/temp.png", "png"),
      TypeIn("#ccCaptcha_TB_I", HustCaptchaToText("./tmp/temp.png", "https://hcr.tuana9a.com")),
      Click("button"),
      WaitForTimeout(3000),
      /*
      must be https://dk-sis.hust.edu.vn/
      not https://dk-sis.hust.edu.vn
      current url will return with '/' at the end
      */
      If(IsEqual(CurrentUrl(), "https://dk-sis.hust.edu.vn/" /* van o trang dang nhap */)).Then([
        SetVars("userError", GetTextContent("#lbStatus") /*sai tai khoan*/),
        SetVars("captchaError", GetTextContent("#ccCaptcha_TB_EC") /*sai captcha*/),
        Break(),
      ]),
      If(IsEqual(CurrentUrl(), "https://www.dk-sis.hust.edu.vn/" /* van o trang dang nhap */)).Then([
        SetVars("userError", GetTextContent("#lbStatus") /*sai tai khoan*/),
        SetVars("captchaError", GetTextContent("#ccCaptcha_TB_EC") /*sai captcha*/),
        Break(),
      ]),
      For(GetValueFromParams((x) => x.classIds)).Each([
        (orderedClassIds) => For(orderedClassIds).Each([
          Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", { clickCount: 3 }),
          (classId) => TypeIn("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", classId),
          /* gui dang ky 1 lop */
          Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btDirectClassRegister_CD"),
          WaitForTimeout(1000),
          /* xem tin nhan tra ve */
          If(IsEqual(GetTextContent("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_lbKQ"), "Thành Công")).Then([
            Break(), /* break neu nguyen vong thanh cong */
          ]),
        ]),
      ]),
      /* gui tat ca dang ky */
      Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btSendRegister_CD"),
      WaitForTimeout(1000),
      /* xac nhan gui dang ky */
      Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_pcYesNo_pcYesNoBody1_ASPxRoundPanel1_btnYes"),
      PageEval(CrawlRegisterResultHandler),
      GoTo("https://dk-sis.hust.edu.vn/Users/Logout.aspx"),
    ]).Catch([
      err => SetVars("systemError", toPrettyErr(err))
    ]),
  ],
});
