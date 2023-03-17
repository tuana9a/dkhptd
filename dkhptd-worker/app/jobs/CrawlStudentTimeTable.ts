import {
  BringToFront,
  GoTo,
  WaitForTimeout,
  ScreenShot,
  TypeIn,
  Click,
  CurrentUrl,
  PageEval,
  If,
  IsEqual,
  Job,
  Break,
  SetVars,
  TextContent,
  Params,
  Action,
  RequiredParamError,
} from "puppeteer-worker-job-builder";

export class ResolveCaptchaAction extends Action {
  imgPath: string;
  endPoint: string;

  constructor(imgPath: string, endpoint: string) {
    super(ResolveCaptchaAction.name);
    this.imgPath = imgPath;
    this.endPoint = endpoint;
  }

  async run() {
    try {
      const { fs, axios, FormData } = this.__context.libs;
      const form = new FormData();
      form.append("file", fs.createReadStream(this.imgPath));
      const predict = await axios
        .post(this.endPoint, form, { headers: form.getHeaders() })
        .then((res) => String(res.data));
      return predict;
    } catch (err) {
      return err.message;
    }
  }
}

export const ResolveCaptcha = (imgPath: string, endpoint: string) => {
  if (!imgPath) throw new RequiredParamError("imgPath").withBuilderName(ResolveCaptcha.name);
  if (!endpoint) throw new RequiredParamError("endpoint").withBuilderName(ResolveCaptcha.name);
  return new ResolveCaptchaAction(imgPath, endpoint).withName(`${ResolveCaptcha.name}: ${endpoint} ${imgPath}`);
};

const CrawlTimeTableHandler = () => {// browser scope not nodejs scope
  // eslint-disable-next-line no-undef
  const table = document.querySelector("#ctl00_ctl00_contentPane_MainPanel_MainContent_gvStudentRegister_DXMainTable");
  const tkb = [];
  table.querySelectorAll(".dxgvDataRow_Mulberry").forEach((row) => {
    const cells = [];
    row.querySelectorAll(".dxgv").forEach(cell => {
      cells.push(cell.textContent.trim().replace(/\s{2,}/g, " "));
    });
    tkb.push({
      ThoiGianHoc: cells[0],
      HocVaoCacTuan: cells[1],
      PhongHoc: cells[2],
      MaLop: cells[3],
      LoaiLop: cells[4],
      Nhom: cells[5],
      MaHocPhan: cells[6],
      TenHocPhan: cells[7],
      GhiChu: cells[8],
    });
  });
  return tkb;
};

export default () => new Job({
  name: "CrawlStudentTimeTable",
  actions: [
    BringToFront(),
    GoTo("https://ctt-sis.hust.edu.vn/Account/Login.aspx"),
    WaitForTimeout(1000),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_rblAccountType_RB0"),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", { clickCount: 3 }),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbUserName_I", Params((p) => p.username)),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_tbPassword_I_CLND", Params((p) => p.password)),
    ScreenShot("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_IMG", "./tmp/temp.png", "png"),
    TypeIn("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_I", ResolveCaptcha("./tmp/temp.png", "https://hcr.tuana9a.com")),
    Click("#ctl00_ctl00_contentPane_MainPanel_MainContent_btLogin_CD"),
    WaitForTimeout(3000),
    If(IsEqual(CurrentUrl(), "https://ctt-sis.hust.edu.vn/Account/Login.aspx")).Then([
      /* van o trang dang nhap */
      TextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_FailureText"), /* sai tai khoan */
      TextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_EC"), /* sai captcha */
      Break(),
    ]),
    GoTo("https://ctt-sis.hust.edu.vn/Students/Timetables.aspx"),
    SetVars("studentTimeTable", PageEval(CrawlTimeTableHandler)),
    GoTo("https://ctt-sis.hust.edu.vn/Account/Logout.aspx"),
    Break(),
  ],
});
