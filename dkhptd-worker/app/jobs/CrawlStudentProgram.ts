import {
  BringToFront,
  GoTo,
  WaitForTimeout,
  SetVars,
  ScreenShot,
  TypeIn,
  Click,
  CurrentUrl,
  PageEval,
  If,
  IsEqual,
  Job,
  Break,
  Params,
  TextContent,
  Action,
  RequiredParamError
} from "puppeteer-worker-job-builder";


class ResolveCaptchaAction extends Action {
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

const ResolveCaptcha = (imgPath: string, endpoint: string) => {
  if (!imgPath) throw new RequiredParamError("imgPath").withBuilderName(ResolveCaptcha.name);
  if (!endpoint) throw new RequiredParamError("endpoint").withBuilderName(ResolveCaptcha.name);
  return new ResolveCaptchaAction(imgPath, endpoint).withName(`${ResolveCaptcha.name}: ${endpoint} ${imgPath}`);
};

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
    If(IsEqual(CurrentUrl(), "https://ctt-sis.hust.edu.vn/Account/Login.aspx" /* van o trang dang nhap */)).Then([
      SetVars("userError", TextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_FailureText")/* sai tai khoan */),
      SetVars("catpchaError", TextContent("#ctl00_ctl00_contentPane_MainPanel_MainContent_ASPxCaptcha1_TB_EC") /* sai captcha */),
      SetVars("studentProgram", PageEval(CrawlStudentProgramHandler)),
      Break(),
    ]).Else([
      GoTo("https://ctt-sis.hust.edu.vn/Students/StudentProgram.aspx"),
      SetVars("studentProgram", PageEval(CrawlStudentProgramHandler)),
      GoTo("https://ctt-sis.hust.edu.vn/Account/Logout.aspx"),
      Break(),
    ]),
  ],
});
