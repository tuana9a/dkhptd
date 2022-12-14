const express = require("express");

const server = express();

const SECRET = process.env.SECRET || "tuana9a";
const BIND = process.env.BIND || "127.0.0.1";
const PORT = process.env.PORT || 8080;
const queue = [];

const auth = (req, resp, next) => {
  const token = req.headers.authorization;
  const { path } = req;
  if (!token || token !== SECRET) {
    resp.status(403).send({ path: path, token: token });
    return;
  }
  next();
};

server.use(express.json());
server.use("/download", auth, express.static("./examples"));

server.get("/api/http-worker-config", auth, (req, resp) => {
  resp.send({
    pollJobUrl: "http://localhost:8080/api/jobs/poll",
    submitJobResultUrl: "http://localhost:8080/api/jobs/result",
    repeatPollJobAfter: 5000,
  });
});

server.get("/api/jobs/poll", auth, (req, resp) => {
  const job = queue.shift();
  resp.send(job);
});

server.post("/api/jobs/result", auth, (req, resp) => {
  try {
    const { body } = req;
    resp.send(body);
  } catch (err) {
    console.error(err);
    resp.status(500).send(err);
  }
});

server.post("/api/jobs/new", auth, (req, resp) => {
  try {
    const { body } = req;
    queue.push(body);
    resp.send(body);
  } catch (err) {
    console.error(err);
    resp.status(500).send(err);
  }
});

server.listen(PORT, BIND);
