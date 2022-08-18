const BASE_URL = "https://ctt-sis.hust.edu.vn";
const LOGIN_URL = `${BASE_URL}/Account/Login.aspx`;
const LOGOUT_URL = `${BASE_URL}/Account/Logout.aspx`;
const STUDENT_PROGRAM_URL = `${BASE_URL}/Students/StudentProgram.aspx`;
const STUDENT_TIMETABLE_URL = `${BASE_URL}/Students/Timetables.aspx`;

const SAVE_CAPTCHA_SCREENSHOT_TO = "./.tmp/temp.png";
const MAX_TRY_CAPTCHA_COUNT = 10;

class Output {
  constructor() {
    this.isServerError = false;
    this.isCaptchaError = false;
    this.isAccountError = false;
    this.messages = [];
    this.data = null;
  }
}

async function captcha2text(filepath, ctx) {
  // get lib
  const { fs, axios, FormData, getCaptchaToTextEndpointsUrl } = ctx;

  // get list of availables captcha2text endpoints
  const response = await axios
    .get(getCaptchaToTextEndpointsUrl)
    .then((res) => res.data);
  const endpoints = response.data;

  if (!Array.isArray(endpoints)) {
    throw new Error("endpoint list is not an array");
  }

  for (const endpoint of endpoints) {
    try {
      const data = new FormData();
      data.append("file", fs.createReadStream(filepath));
      const headers = data.getHeaders();
      const result = await axios
        .post(endpoint, data, { headers })
        .then((res) => String(res.data).trim());
      return result;
    } catch (err) {
      // ignore
    }
  }
  throw new Error("No endpoints available");
}

async function gotoLoginPage(ctx) {
  const { page } = ctx;
  // EXPLAIN: vẫn phải try catch vì goto có thể đã failed
  await page.bringToFront();
  await page.goto(LOGIN_URL);
  await page.waitForTimeout(1000);
  return new Output();
}

async function loginOnce(ctx) {
  const { input: entry, page } = ctx;
  const captchaPath = SAVE_CAPTCHA_SCREENSHOT_TO;
  const $captchaImg =
    "#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_IMG";
  const captchaImgElement = await page.$($captchaImg);
  await captchaImgElement.screenshot({ path: captchaPath, type: "png" });
  const captchaToTextResult = await captcha2text(captchaPath, ctx);
  // click option 3 times
  const $loginRoleOption =
    "#ctl00_ctl00_contentPane_MainPanel_MainContent_rblAccountType_RB0";
  await page.click($loginRoleOption);
  // type username
  const $inputUsername =
    "#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I";
  await page.click($inputUsername, { clickCount: 3 });
  await page.type($inputUsername, entry.username);
  // type password
  const $inputPassword =
    "#ctl00_ctl00_contentPane_MainPanel_MainContent_tbPassword_I_CLND";
  await page.type($inputPassword, entry.password);
  // type captcha
  const $inputCaptcha =
    "#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_I";
  await page.type($inputCaptcha, captchaToTextResult);
  // EXPLAIN: mệt vlon
  const $loginButton =
    "#ctl00_ctl00_contentPane_MainPanel_MainContent_btLogin_CD";
  await Promise.all([
    page.click($loginButton),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.waitForTimeout(3000),
  ]);

  // EXPLAIN: check login success
  const output = new Output();
  if (page.url() === LOGIN_URL) {
    // EXPLAIN: nếu vẫn ở màn hình đăng nhập có thể có lỗi
    const $captchaError =
      "#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_EC";
    const captchaErrMsg = await page.$eval($captchaError, (e) => e.textContent);
    if (captchaErrMsg) {
      output.isCaptchaError = true;
      output.messages.push(captchaErrMsg);
    }
    const $accountErr =
      "#ctl00_ctl00_contentPane_MainPanel_MainContent_FailureText";
    const accountErrMsg = await page.$eval($accountErr, (e) => e.textContent);
    if (accountErrMsg) {
      output.isAccountError = true;
      output.messages.push(accountErrMsg);
    }
  }
  return output;
}

async function loginUntilSuccess(ctx) {
  // bắt đầu thực thi vòng lặp
  let tryCaptchaCount = 0;
  let output = new Output();
  while (tryCaptchaCount < MAX_TRY_CAPTCHA_COUNT) {
    tryCaptchaCount += 1;
    output = await loginOnce(ctx);
    if (output.isAccountError) {
      // nếu user sai thì k quan tâm captcha phải break luôn và không làm gì cả
      return output;
    }
    if (output.isCaptchaError) {
      // nếu là lỗi captcha thì tiếp tục vòng lặp cho tới khi max retry captcha reach
      // eslint-disable-next-line no-continue
      continue;
    }
    // nếu captcha không sai (cả user và captcha đều đúng ok chuyển tiếp)
    break;
  }
  return output;
}

async function crawlStudentProgram(ctx) {
  const { page } = ctx;
  await page.goto(STUDENT_PROGRAM_URL);
  const output = new Output();
  const studentprogram = await page.evaluate(() => {
    // note: browser scope not nodejs scope
    const classes = [];
    const selector =
      "#ctl00_ctl00_contentPane_MainPanel_MainContent_ProgramCoursePanel_gvStudentProgram_DXMainTable";
    // eslint-disable-next-line no-undef
    const table = document.querySelector(selector);
    const rows = table.querySelectorAll(".dxgvDataRow");
    rows.forEach((row) => {
      const values = Array.from(row.querySelectorAll(".dxgv"))
        .map((col) => col.textContent)
        .map((col) => col.trim().replace(/\s{2,}/g, " "));
      const classs = {
        MaHocPhan: values[2],
        TenHocPhan: values[3],
        KyHoc: values[4],
        BatBuoc: values[5],
        TinChiDaoTao: values[6],
        TinChiHoc: values[7],
        MaHocPhanHoc: values[8],
        LoaiHocPhan: values[9],
        DiemChu: values[10],
        DiemSo: values[11],
        KhoaVien: values[12],
      };
      classes.push(classs);
    });
    return classes;
  });
  output.data = studentprogram;
  return output;
}

async function crawlTimeTable(ctx) {
  const { page } = ctx;
  const output = new Output();
  await page.goto(STUDENT_TIMETABLE_URL);
  const timetable = await page.evaluate(() => {
    // note: browser scope not nodejs scope
    const classes = [];
    const selectorTable =
      "#ctl00_ctl00_contentPane_MainPanel_MainContent_gvStudentRegister_DXMainTable";
    // eslint-disable-next-line no-undef
    const table = document.querySelector(selectorTable);
    const rows = table.querySelectorAll(".dxgvDataRow_Mulberry");
    rows.forEach((row) => {
      const values = Array.from(row.querySelectorAll(".dxgv"))
        .map((col) => col.textContent)
        .map((col) => col.trim().replace(/\s{2,}/g, " "));
      classes.push({
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
    return classes;
  });
  output.data = timetable;
  return output;
}

async function logout(ctx) {
  const { page } = ctx;
  await page.goto(LOGOUT_URL);
  return new Output();
}

/**
 * error on user or account of user
 */
function onAccountError(output) {
  if (output.isAccountError) return true;
  return false;
}

/**
 * error on server or school server
 */
function onServerError(output) {
  if (output.isServerError) return true;
  return false;
}

/**
 * error of user or server
 */
function onAccountOrServerError(output) {
  if (onAccountError(output)) return true;
  if (onServerError(output)) return true;
  return false;
}

module.exports = {
  checkAccount: {
    name: "checkAccount",
    tasks: [
      { run: gotoLoginPage, breaker: onServerError },
      { run: loginUntilSuccess, breaker: onAccountOrServerError },
      { run: logout },
    ],
  },
  crawlStudentProgram: {
    name: "crawlStudentProgram",
    tasks: [
      { run: gotoLoginPage, breaker: onServerError },
      { run: loginUntilSuccess, breaker: onAccountOrServerError },
      { run: crawlStudentProgram, breaker: onServerError },
      { run: logout },
    ],
  },
  crawlTimeTable: {
    name: "crawlTimeTable",
    tasks: [
      { run: gotoLoginPage, breaker: onServerError },
      { run: loginUntilSuccess, breaker: onAccountOrServerError },
      { run: crawlTimeTable, breaker: onServerError },
      { run: logout },
    ],
  },
};
