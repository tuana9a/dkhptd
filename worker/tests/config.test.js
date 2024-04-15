const { cfg } = require("../dist/configs");
const { update } = require("../dist/utils");

describe("test config", () => {
  test("should match default value", () => {
    expect(cfg.toJson()).toEqual({
      configFile: undefined,
      workerId: expect.any(String),
      workerType: "http",
      tmpDir: "./tmp/",
      logDest: "cs",
      logDir: "./logs/",
      secret: undefined,
      jobDir: "./jobs/",
      scheduleDir: "./schedules/",
      accessToken: undefined,
      httpWorkerPullConfigUrl: undefined,
      rabbitmqConnectionString: undefined,
      maxTry: 10,
      puppeteerLaunchOption: {
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
        slowMo: 10,
      },
    });
  });

  test("should match updated value", () => {
    update(cfg, {
      tmpDir: "otherTmpDir",
      secret: "iloveyou",
      maxTry: 11,
    });
    expect(cfg.toJson()).toEqual({
      workerType: "http",
      workerId: expect.any(String),
      configFile: undefined,
      tmpDir: "otherTmpDir",
      logDest: "cs",
      logDir: "./logs/",
      secret: "iloveyou",
      jobDir: "./jobs/",
      scheduleDir: "./schedules/",
      accessToken: undefined,
      httpWorkerPullConfigUrl: undefined,
      rabbitmqConnectionString: undefined,
      maxTry: 11,
      puppeteerLaunchOption: {
        headless: false,
        slowMo: 10,
        defaultViewport: null,
      },
    });
  });
});
