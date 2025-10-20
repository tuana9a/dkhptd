import { Context } from "../types";

const CrawlRegisterResultHandler = () => { // browser scope not nodejs scope
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

export default async (ctx: Context) => {
  const page = ctx.page;
  const { axios, FormData, fs, _, path } = ctx.libs;
  const logs = ctx.logs;
  const params = ctx.params;
  const utils = ctx.utils;
  const workDir = ctx.workDir;
  try {
    logs.push({ msg: `go to login page` });
    await page.bringToFront();

    // init userdata
    await page.goto("http://dk-sis.hust.edu.vn/");
    await page.reload();
    await page.reload();

    await page.goto("https://dk-sis.hust.edu.vn/Users/Login.aspx");
    await page.waitForTimeout(3000);
    await page.reload();

    logs.push({ msg: "start login" })
    await page.click("#tbUserName", { clickCount: 3 });
    await page.type("#tbUserName", params.username);
    await page.type("#tbPassword_CLND", params.password);

    logs.push({ msg: "resolve captcha" })
    await (await page.$("#ccCaptcha_IMG")).screenshot({ path: path.join(workDir, "/current-captcha.png"), type: "png" });
    const form = new FormData();
    form.append("file", fs.createReadStream(path.join(workDir, "./current-captcha.png")));
    const captchaValue = await axios.post("https://hcr.tuana9a.com", form, { headers: form.getHeaders() }).then((res) => String(res.data));
    logs.push({ msg: `resolve captcha completed`, data: captchaValue });
    await page.type("#ccCaptcha_TB_I", captchaValue);

    logs.push({ msg: `click login button` })
    await page.click("button");

    let currentUrl = page.url();
    logs.push({ msg: `check current url`, data: currentUrl })
    let checkCurrentUrlCount = 0;
    while (
      currentUrl == "https://dk-sis.hust.edu.vn/Users/Login.aspx"
      || currentUrl == "http://dk-sis.hust.edu.vn/"
      || currentUrl == "http://www.dk-sis.hust.edu.vn/"
      || currentUrl == "https://dk-sis.hust.edu.vn/"
      || currentUrl == "https://www.dk-sis.hust.edu.vn/"
      || currentUrl == "http://dk-sis.hust.edu.vn"
      || currentUrl == "http://www.dk-sis.hust.edu.vn"
      || currentUrl == "https://dk-sis.hust.edu.vn"
      || currentUrl == "https://www.dk-sis.hust.edu.vn"
    ) {
      if (checkCurrentUrlCount > 10) {
        _.set(ctx.vars, "userError", await page.$eval("#lbStatus", (e: Element) => e.textContent)); //sai tai khoan
        _.set(ctx.vars, "captchaError", await page.$eval("#ccCaptcha_TB_EC", (e: Element) => e.textContent)); //sai captcha
        logs.push({ msg: `finished early` })
        return ctx;
      }
      checkCurrentUrlCount += 1;
      await page.waitForTimeout(3000);
      currentUrl = page.url();
      logs.push({ msg: `check current url`, data: currentUrl })
    }

    logs.push({ msg: `start register classes` })
    for (const classId in params.classIds) {
      await page.click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", { clickCount: 3 });
      await page.type("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I", classId);
      /* gui dang ky 1 lop */
      await page.click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btDirectClassRegister_CD", { clickCount: 3 });
      await page.waitForTimeout(1000);
      /* xem tin nhan tra ve */
      _.set(ctx.vars, `registerMessages.classId-${classId}`, await page.$eval("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_lbKQ", (e: Element) => e.textContent))
    }
    logs.push({ msg: `finished register classes` })

    /* gui tat ca dang ky */
    logs.push({ msg: `send all register classes` })
    await page.click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btSendRegister_CD");
    await page.waitForTimeout(1000);
    await page.click("#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_pcYesNo_pcYesNoBody1_ASPxRoundPanel1_btnYes");
    await page.waitForTimeout(1000);

    /* lay ket qua */
    logs.push({ msg: `crawl result registered classes` })
    _.set(ctx.vars, "registerResult", await page.evaluate(CrawlRegisterResultHandler));
    await page.goto("https://dk-sis.hust.edu.vn/Users/Logout.aspx");
  } catch (err) {
    _.set(ctx.vars, "systemError", utils.toPrettyErr(err));
    ctx.isFatalError = true;
    logs.push({ msg: `fatal error`, data: utils.toPrettyErr(err) })
  }
  return ctx
};
