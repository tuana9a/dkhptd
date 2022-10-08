const express = require("express");
const amqp = require("amqplib/callback_api");

const server = express();

const SECRET = process.env.SECRET || "tuana9a";
const BIND = process.env.BIND || "127.0.0.1";
const PORT = process.env.PORT || 8080;
const RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_CONNECTION_STRING || "amqp://localhost:5672";
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

server.get("/api/http-worker-config", (req, resp) => {
  resp.send({
    pollJobUrl: "http://localhost:8080/api/jobs/poll",
    submitJobResultUrl: "http://localhost:8080/api/jobs/result",
  });
});

server.get("/api/jobs/poll", (req, resp) => {
  const job = queue.shift();
  resp.send(job);
});

server.post("/api/jobs/result", (req, resp) => {
  try {
    const { body } = req;
    console.log(body);
    resp.send(body);
  } catch (err) {
    console.error(err);
    resp.status(500).send(err);
  }
});

server.post("/api/jobs/new", auth, (req, resp) => {
  try {
    const { body } = req;
    console.log(body);
    queue.push(body);
    resp.send(body);
  } catch (err) {
    console.error(err);
    resp.status(500).send(err);
  }
});

server.listen(PORT, BIND);

const newJobExchange = "new_job";
const workerRegisterExchange = "puppeter_worker_register";
const submitJobResultExchange = "submit_job_result";
const queueId = `dangkyhocphantudong_${Date.now()}_${(Math.random() * 1000).toFixed(0)}`;

amqp.connect(RABBITMQ_CONNECTION_STRING, (error0, connection) => {
  if (error0) {
    console.error(error0);
    return;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      console.error(error1);
      return;
    }

    channel.assertExchange(newJobExchange, "direct", { durable: false });
    channel.assertExchange(workerRegisterExchange, "fanout", { durable: false });
    channel.assertExchange(submitJobResultExchange, "fanout", { durable: false });
    channel.assertQueue(queueId, { exclusive: true }, (error2, q) => {
      if (error2) {
        console.error(error2);
        return;
      }

      console.log("Waiting for results. To exit press CTRL+C");
      const routingKey = queueId;
      channel.bindQueue(q.queue, submitJobResultExchange, routingKey);
      channel.consume(q.queue, async (msg) => {
        console.log(`Received RabbitMQ ${msg.fields.routingKey} ${msg.content.toString()}`);
        try {
          const result = JSON.parse(msg.content.toString());
        } catch (err) {
          console.error(err);
        }
        channel.ack(msg);
      }, { noAck: false });
    });
  });
});
