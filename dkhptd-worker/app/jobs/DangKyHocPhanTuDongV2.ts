import { BringToFront, GoTo, WaitForTimeout, ScreenShot, TypeIn, Click, CurrentUrl, PageEval, If, IsEqual, For, Job, Break, Try, SetVars, Params, TextContent, Reload } from "puppeteer-worker-job-builder";
import { ResolveCaptcha } from "../job-builders";
import { toPrettyErr } from "../utils";

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
  name: "DangKyHocPhanTuDongV2",
  actions: [
    BringToFront(),
    Try([
      // GoTo("https://dk-sis.hust.edu.vn"),
      GoTo("https://dk-sis.hust.edu.vn/Users/Login.aspx"),
      WaitForTimeout(1000),
      Reload(),
      Click("#tbUserName", { clickCount: 3 }),
      TypeIn("#tbUserName", Params((p) => p.username)),
      TypeIn("#tbPassword_CLND", Params((p) => p.password)),
      ScreenShot("#ccCaptcha_IMG", "./tmp/temp.png", "png"),
      TypeIn("#ccCaptcha_TB_I", ResolveCaptcha("./tmp/temp.png", "https://hcr.tuana9a.com")),
      Click("button"),
      WaitForTimeout(3000),
      If(IsEqual(CurrentUrl(), "https://dk-sis.hust.edu.vn/Users/Login.aspx" /* van o trang dang nhap */)).Then([
        SetVars("userError", TextContent("#lbStatus") /*sai tai khoan*/),
        SetVars("captchaError", TextContent("#ccCaptcha_TB_EC") /*sai captcha*/),
        Break(),
      ]),
      For(Params((x) => x.classIds)).Each([
        (orderedClassIds) => For(orderedClassIds).Each([
          Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", { clickCount: 3 }),
          (classId) => TypeIn("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", classId),
          /* gui dang ky 1 lop */
          Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btDirectClassRegister_CD"),
          WaitForTimeout(1000),
          /* xem tin nhan tra ve */
          (classId) => SetVars(`registerMessages.classId-${classId}`, TextContent("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_lbKQ")),
          If(IsEqual(TextContent("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_lbKQ"), "")).Then([
            Break(), /* break neu nguyen vong khong thong bao gi tuc la thanh cong */
          ]),
        ]),
      ]),
      /* gui tat ca dang ky */
      Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btSendRegister_CD"),
      WaitForTimeout(1000),
      /* xac nhan gui dang ky */
      Click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_pcYesNo_pcYesNoBody1_ASPxRoundPanel1_btnYes"),
      SetVars("registerResult", PageEval(CrawlRegisterResultHandler)),
      GoTo("https://dk-sis.hust.edu.vn/Users/Logout.aspx"),
    ]).Catch([
      err => SetVars("systemError", toPrettyErr(err))
    ]),
  ],
});
