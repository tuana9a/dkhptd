const express = require("express");

const server = express();

const SECRET = process.env.SECRET || "tuana9a";
const BIND = process.env.BIND || "127.0.0.1";
const PORT = process.env.PORT || 8080;
const BASE_JOB_DOWNLOAD_URL =
  process.env.BASE_JOB_DOWNLOAD_URL ||
  `http://localhost:${PORT}/api/jobs/download`;

const logger = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

const queue = [];

const cmds = new Map();

cmds.set("poll-job", (req, resp) => {
  const jobsToSend = [];
  let entry;
  while ((entry = queue.shift())) {
    jobsToSend.push(entry);
  }
  resp.send({
    data: jobsToSend,
  });
});

cmds.set("push-job", (req, resp) => {
  let body = {};
  try {
    body = req.body;
    const data = body.data;
    queue.push(...data);
  } catch (err) {
    logger.error(err);
  }
  resp.send(body);
});

cmds.set("submit-result", (req, resp) => {
  let body = {};
  try {
    body = req.body;
  } catch (err) {
    logger.error(err);
  }
  resp.send(body);
});

cmds.set("get-job-info", (req, resp) => {
  resp.send({
    data: [
      {
        key: "ctt-sis.hust.edu.vn",
        fileName: "ctt-sis.hust.edu.vn.js",
        downloadUrl: `${BASE_JOB_DOWNLOAD_URL}/ctt-sis.hust.edu.vn.js`,
      },
      {
        key: "dk-sis.hust.edu.vn",
        fileName: "dk-sis.hust.edu.vn.js",
        downloadUrl: `${BASE_JOB_DOWNLOAD_URL}/dk-sis.hust.edu.vn.js`,
      },
    ],
  });
});

const auth = (req, resp, next) => {
  const token = (req.headers.authorization || "").split(/\s/)[1];
  const path = req.path;
  const auth = req.headers.authorization;
  logger.log(`t=${Date.now()}`, `p="${path}"`, `a="${auth}"`, `t="${token}"`);

  if (!token || token != SECRET) {
    resp.status(403).send("invalid token");
    return;
  }

  next();
};

server.use(express.json());
server.use("/api/jobs/download", auth, express.static("./examples"));
// custom endpoint for worker call when doing jobs see ./examples/ctt-sis.hust.edu.vn.js
server.get("/api/getCaptchaToTextEndpointsUrl", (req, resp) => {
  resp.send({
    data: ["http://localhost:5000"],
  });
});
server.post("/api/jobs", auth, (req, resp) => {
  try {
    const body = req.body;
    logger.log(body);
    const cmd = cmds.get(body.cmd);

    if (!cmd) {
      resp.status(404).send("cmd not found");
      return;
    }

    cmd(req, resp);
  } catch (err) {
    logger.error(err);
    resp.sendStatus(500);
  }
});

server.listen(PORT, BIND);
