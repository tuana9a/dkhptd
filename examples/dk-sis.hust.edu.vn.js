const LOGIN_URL = "http://dk-sis.hust.edu.vn/Users/Login.aspx";
const LOGOUT_URL = "http://dk-sis.hust.edu.vn/Users/Logout.aspx";
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

const textContent = (e) => e.textContent;

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
  const $captchaImg = "#ccCaptcha_IMG";
  const captchaImgElement = await page.$($captchaImg);
  await captchaImgElement.screenshot({ path: captchaPath, type: "png" });
  const captchaToTextResult = await captcha2text(captchaPath, ctx);
  const $inputUsername = "#tbUserName";
  await page.click($inputUsername, { clickCount: 3 });
  await page.type($inputUsername, entry.username);
  const $inputPassword = "#tbPassword_CLND";
  await page.type($inputPassword, entry.password);
  const $inputCaptcha = "#ccCaptcha_TB_I";
  await page.type($inputCaptcha, captchaToTextResult);
  // EXPLAIN: mệt vlon
  const $loginButton = "button";
  await Promise.all([
    page.click($loginButton),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.waitForTimeout(3000),
  ]);
  // EXPLAIN: check login success
  const output = new Output();
  if (page.url() === LOGIN_URL) {
    // EXPLAIN: nếu vẫn ở màn hình đăng nhập có thể có lỗi
    // check captcha error
    const $captchaErr = "#ccCaptcha_TB_EC";
    const captchaErrMsg = await page.$eval($captchaErr, textContent);
    if (captchaErrMsg) {
      output.isCaptchaError = true;
      output.messages.push(captchaErrMsg);
    }
    // check account error
    const $accountErr = "#lbStatus";
    const accountErrMsg = await page.$eval($accountErr, textContent);
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

async function autoRegisterClasses(ctx) {
  const { input: entry, page } = ctx;
  const { classIds } = entry;
  const output = new Output();
  const responseMessages = [];
  // EXPLAIN: main function
  const $inputClassId =
    "#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_tbDirectClassRegister_I";
  const $sendClassIdButton =
    "#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btDirectClassRegister_CD";
  const $responseClassIdMessage =
    "#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_lbKQ";
  for await (const classId of classIds) {
    // click vào ô nhập mã lớp 3 lần
    await page.click($inputClassId, { clickCount: 3 });
    // nhập mã lớp
    await page.type($inputClassId, String(classId));
    // nhấn gửi đăng ký
    await page.click($sendClassIdButton);
    await page.waitForTimeout(1000);
    // kiểm tra tin nhắn trả về
    const msg = await page.$eval($responseClassIdMessage, textContent);
    responseMessages.push({ classId, message: msg });
  }
  // ấn nút gửi đăng ký
  const $submitAllButton =
    "#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_btSendRegister_CD";
  await page.click($submitAllButton);
  await page.waitForTimeout(1000);
  // xác nhận gửi đăng ký
  const $submitAllConfirmYes =
    "#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_pcYesNo_pcYesNoBody1_ASPxRoundPanel1_btnYes";
  await page.click($submitAllConfirmYes);
  await page.waitForTimeout(1000);
  // note: premium feature: screen shot after automation
  output.data = responseMessages;
  return output;
}

async function crawlRegisterResult(ctx) {
  const { page } = ctx;
  // EXPLAIN: check result after submit
  const output = new Output();
  const statusOfClasses = await page.evaluate(() => {
    // note: browser scope not nodejs scope
    const classes = [];
    const selector =
      "ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_ASPxCallbackPanel1_gvRegisteredList_DXMainTable";
    // eslint-disable-next-line no-undef
    const table = document.getElementById(selector);
    // lấy data html đăng kí lớp
    const rows = Array.from(table.querySelectorAll("tr.dxgvDataRow_Moderno"));
    rows.forEach((row) => {
      const values = Array.from(row.querySelectorAll("td"))
        .map(textContent)
        .map((col) => col.trim().replace(/\s{2,}/g, " "));
      classes.push({
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
    return classes;
  });
  output.data = statusOfClasses;
  return output;
}

async function logout(ctx) {
  const { page } = ctx;
  await page.goto(LOGOUT_URL);
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
  autoRegisterClasses: {
    name: "autoRegisterClasses",
    tasks: [
      { run: gotoLoginPage, breaker: onServerError },
      { run: loginUntilSuccess, breaker: onAccountOrServerError },
      { run: autoRegisterClasses, breaker: onServerError },
      { run: crawlRegisterResult, breaker: onServerError },
      { run: logout },
    ],
  },
};
