#!/usr/bin/env node

require('dotenv').config();

const { launch } = require("./dist/index.js");

const puppeteerLaunchOptions = {};
puppeteerLaunchOptions["docker"] = {
  "args": [
    "--no-sandbox",
    "--disable-setuid-sandbox"
  ],
  "slowMo": 10,
  "defaultViewport": {
    "width": 1920,
    "height": 1080
  },
  "executablePath": "google-chrome-stable",
  "userDataDir": "./userdata.tmp/"
}
puppeteerLaunchOptions["linux-headless"] = {
  "slowMo": 10,
  "defaultViewport": {
    "width": 1920,
    "height": 1080
  },
  "executablePath": "google-chrome-stable",
  "userDataDir": "./userdata.tmp/"
}
puppeteerLaunchOptions["linux-visible"] = {
  "slowMo": 10,
  "headless": false,
  "defaultViewport": null,
  "executablePath": "google-chrome-stable",
  "userDataDir": "./userdata.tmp/"
}
puppeteerLaunchOptions["window-headless"] = {
  "slowMo": 10,
  "defaultViewport": {
    "width": 1920,
    "height": 1080
  },
  "executablePath": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "userDataDir": "./userdata.tmp/"
}
puppeteerLaunchOptions["window-visible"] = {
  "headless": false,
  "slowMo": 10,
  "defaultViewport": null,
  "executablePath": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "userDataDir": "./userdata.tmp/"
}

launch({
  id: process.env.ID,
  type: process.env.TYPE || "standalone", // ["rabbit", "rabbit1", "standalone"]
  logDest: process.env.LOG_DEST || "cs",
  jobDir: process.env.JOB_DIR || "./dist/jobs",
  logWorkerDoing: process.env.LOG_WORKER_DOING || false,
  puppeteerLaunchOptions: puppeteerLaunchOptions[process.env.PUPPETEER_LAUNCH_OPTIONS_TYPE] || puppeteerLaunchOptions["linux-headless"],
  rabbitmqConnectionString: process.env.RABBITMQ_CONNECTION_STRING,
  amqpEncryptionKey: process.env.AMQP_ENCRYPTION_KEY,
  schedulesDir: process.env.SCHEDULES_DIR,
});
