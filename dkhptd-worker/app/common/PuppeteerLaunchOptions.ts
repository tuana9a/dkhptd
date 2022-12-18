const PuppeteerLaunchOptions = new Map();

PuppeteerLaunchOptions.set("default", {
  // default run in headless mode
  slowMo: 10,
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
});

PuppeteerLaunchOptions.set("headless", {
  slowMo: 10,
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
});

PuppeteerLaunchOptions.set("visible", {
  headless: false,
  slowMo: 10,
  defaultViewport: null,
});

PuppeteerLaunchOptions.set("docker", {
  slowMo: 10,
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
  executablePath: "google-chrome-stable",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

export default PuppeteerLaunchOptions;
