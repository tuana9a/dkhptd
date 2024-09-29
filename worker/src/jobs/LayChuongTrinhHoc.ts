import { Context } from "../types";

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
    await page.goto("https://ctt-sis.hust.edu.vn/Account/Login.aspx");
    await page.waitForTimeout(1000);
    await page.click("#ctl00_ctl00_contentPane_MainPanel_MainContent_rblAccountType_RB0");

    logs.push({ msg: "start login" })
    await page.click("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", { clickCount: 3 });
    await page.type("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", params.username);
    await page.type("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbPassword_I_CLND", params.password);

    logs.push({ msg: "resolve captcha" })
    await (await page.$("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_IMG")).screenshot({ path: path.join(workDir, "./current-captcha.png"), type: "png" });
    const form = new FormData();
    form.append("file", fs.createReadStream(path.join(workDir, "./current-captcha.png")));
    const captchaValue = await axios.post("https://hcr.tuana9a.com", form, { headers: form.getHeaders() }).then((res) => String(res.data));
    logs.push({ msg: `resolve captcha completed`, data: captchaValue });
    await page.type("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_I", captchaValue);

    logs.push({ msg: `click login button` })
    await page.click("#ctl00_ctl00_contentPane_MainPanel_MainContent_btLogin_CD");
    await page.waitForTimeout(3000);

    let currentUrl = page.url();
    logs.push({ msg: `check current url`, data: currentUrl })

    if (
      currentUrl == "https://ctt-sis.hust.edu.vn/Account/Login.aspx"
      || currentUrl == "https://ctt-sis.hust.edu.vn/Account/Login.aspx/"
    ) {
      _.set(ctx.vars, "userError", await page.$eval("#ctl00_ctl00_contentPane_MainPanel_MainContent_FailureText", (e: Element) => e.textContent)); //sai tai khoan
      _.set(ctx.vars, "captchaError", await page.$eval("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_EC", (e: Element) => e.textContent)); //sai captcha
      logs.push({ msg: `finished early` })
      return ctx;
    }

    await page.goto("https://ctt-sis.hust.edu.vn/Students/StudentProgram.aspx");
    _.set(ctx.vars, "studentProgram", await page.evaluate(CrawlStudentProgramHandler));

    await page.goto("https://ctt-sis.hust.edu.vn/Account/Logout.aspx");
  } catch (err) {
    _.set(ctx.vars, "systemError", utils.toPrettyErr(err));
    ctx.isFatalError = true;
    logs.push({ msg: `fatal error`, data: utils.toPrettyErr(err) })
  }
  return ctx
};
