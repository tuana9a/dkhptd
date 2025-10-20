import amqp from "amqplib/callback_api";
import crypto from "crypto";

import { PuppeteerWorker } from "./puppeteer-worker";
import { AvailableJobs } from "./repos";
import { PuppeteerDisconnectedError } from "./errors";
import logger from "./logger";
import { ensureDirExists, update, ensurePageCount, toJson, toBuffer } from "./utils";
import { cfg, Config, correctConfig, ExchangeName, puppeteerLaunchOptions, QueueName } from "./configs";
import { Browser } from "puppeteer-core";
import DangKyLopTuDong from "./jobs/DangKyLopTuDong";
import { c } from "./cypher";
import { DoingInfo } from "./types";

export async function launch(initConfig: Config) {
  update(cfg, initConfig);
  correctConfig(cfg);
  ensureDirExists(cfg.tmpDir);
  ensureDirExists(cfg.logDir);
  ensureDirExists(cfg.puppeteerLaunchOptions.userDataDir);

  logger.use(cfg.logDest);
  logger.info(`Config: ${toJson(cfg)}`);
  const availableJobs = new AvailableJobs();
  const puppeteerWorker = new PuppeteerWorker(availableJobs);

  availableJobs.update("DangKyLopTuDong", DangKyLopTuDong);
  availableJobs.update("DangKyHocPhanTuDong", DangKyLopTuDong);
  availableJobs.update("DangKyHocPhanTuDongV1", DangKyLopTuDong);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const browser: Browser = await require("puppeteer-core").launch(cfg.puppeteerLaunchOptions);
  await ensurePageCount(browser, 1);
  puppeteerWorker.setBrowser(browser);

  browser.on("disconnected", () => logger.error(new PuppeteerDisconnectedError()));
  browser.on("disconnected", () => setTimeout(() => process.exit(1), 1000));

  amqp.connect(cfg.rabbitmqConnectionString, (error0, connection) => {
    if (error0) {
      logger.error(error0);
      return process.exit(1);
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        logger.error(error1);
        return process.exit(1);
      }
      channel.prefetch(1);
      channel.assertExchange(ExchangeName.WORKER_PING, "fanout", {});
      channel.assertExchange(ExchangeName.WORKER_DOING, "fanout", {});
      channel.assertQueue(QueueName.PROCESS_JOB_V1_RESULT, {});
      channel.assertQueue(QueueName.RUN_JOB_V1, {}, (error2, q) => {
        if (error2) {
          logger.error(error2);
          return process.exit(1);
        }
        channel.consume(q.queue, async (msg) => {
          const request = JSON.parse(c(cfg.amqpEncryptionKey).d(msg.content.toString(), msg.properties.headers.iv));
          logger.info(`Received ${msg.fields.routingKey} ${toJson(request)}`);
          let onDoing = (doing: DoingInfo) => {
            channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({ workerId: cfg.id, doing })));
          };

          if (cfg.logWorkerDoing) {
            onDoing = (doing: DoingInfo) => {
              logger.info(`Doing ${request.id} ${toJson(doing)}`);
              channel.publish(ExchangeName.WORKER_DOING, "", toBuffer(toJson({ workerId: cfg.id, doing })));
            };
          }
          const { logs, vars } = await puppeteerWorker.process(request, { onDoing: onDoing });
          logger.info(`Logs ${request.id} ${toJson(logs)}`);

          const newIv = crypto.randomBytes(16).toString("hex");
          const eResult = c(cfg.amqpEncryptionKey).e(toJson({
            id: request.id,
            workerId: cfg.id,
            logs,
            vars,
          }), newIv);

          channel.sendToQueue(QueueName.PROCESS_JOB_V1_RESULT, toBuffer(eResult), { headers: { iv: newIv } });
          channel.ack(msg);
        }, { noAck: false });
      });
      setInterval(() => channel.publish(ExchangeName.WORKER_PING, "", toBuffer(toJson({ workerId: cfg.id }))), 3000);
    });
  });
}

launch({
  id: process.env.ID,
  logDest: process.env.LOG_DEST || "cs",
  jobDir: process.env.JOB_DIR || "./dist/jobs",
  logWorkerDoing: Boolean(process.env.LOG_WORKER_DOING) || false,
  puppeteerLaunchOptions: puppeteerLaunchOptions[process.env.PUPPETEER_LAUNCH_OPTIONS_TYPE] || puppeteerLaunchOptions["linux-headless"],
  rabbitmqConnectionString: process.env.RABBITMQ_CONNECTION_STRING,
  amqpEncryptionKey: process.env.AMQP_ENCRYPTION_KEY,
  schedulesDir: process.env.SCHEDULES_DIR,
});
