const options = new Map();

options.set("default", {
  // default run in headless mode
  slowMo: 10,
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
});

options.set("headless", {
  slowMo: 10,
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
});

options.set("visible", {
  headless: false,
  slowMo: 10,
  defaultViewport: null,
});

options.set("docker", {
  slowMo: 10,
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
  executablePath: "google-chrome-stable",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

module.exports = options;
