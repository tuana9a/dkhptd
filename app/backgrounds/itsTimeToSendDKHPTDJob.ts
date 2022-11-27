import { ObjectId } from "mongodb";
import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import JobStatus from "../configs/JobStatus";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import DKHPTDJob from "../entities/DKHPTDJob";
import emitter from "../listeners/emiter";
import logger from "../loggers/logger";
import loop from "../utils/loop";

export default {
  setup() {
    loop.infinity(async () => {
      try {
        const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).find({
          timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
          status: JobStatus.READY,
        }, { sort: { timeToStart: 1 } });
        while (await cursor.hasNext()) {
          const entry = await cursor.next();
          const job = new DKHPTDJob(entry);
          emitter.emit(AppEvent.NEW_JOB, {
            name: "DangKyHocPhanTuDong",
            params: {
              username: job.username,
              password: job.password,
              classIds: job.classIds,
            },
          });
          await mongoConnectionPool.getClient()
            .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).updateOne({ _id: new ObjectId(job._id) }, {
              $set: {
                status: JobStatus.DOING,
                doingAt: Date.now(),
              },
            });
        }
      } catch (err) {
        logger.error(err);
      }
    }, 10_000);
  }
};
