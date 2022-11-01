const express = require("express");
const { ObjectId } = require("mongodb");
const ObjectModifer = require("../modifiers/ObjectModifier");
const PickProps = require("../modifiers/PickProps");
const BaseResponse = require("../payloads/BaseResponse");
const ExceptionHandler = require("./ExceptionHandler");
const resolveFilter = require("../utils/resolveMongoFilter");
const SecretAuth = require("../middlewares/SecretAuth");
const config = require("../config");
const DangKyHocPhanTuDongJob = require("../entities/DangKyHocPhanTuDongJob");
const JwtFilter = require("../middlewares/JwtFilter");

module.exports = (db, collectionName) => {
  const router = express.Router();
  router.get("/api/accounts/current/dkhptd-s", JwtFilter(config.SECRET), ExceptionHandler(async (req, resp) => {
    const query = new ObjectModifer([
      PickProps(["status", "timeToStart", "username"], { dropFalsy: true }),
    ]).apply(req.query);
    const accountId = req.__accountId;

    const filter = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(accountId);
    const jobs = await db.collection(collectionName).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DangKyHocPhanTuDongJob(x).toClient())));
  }));

  router.get("/api/accounts/:otherAccountId/current/dkhptd-s", SecretAuth(config.SECRET), ExceptionHandler(async (req, resp) => {
    const query = new ObjectModifer([
      PickProps(["status", "timeToStart", "username"], { dropFalsy: true }),
    ]).apply(req.query);
    // TODO: check privilege of account
    const filter = query.q ? resolveFilter(query.q.split(",")) : {};
    filter.ownerAccountId = new ObjectId(req.params.otherAccountId);
    const jobs = await db.collection(collectionName).find(filter).toArray();
    resp.send(new BaseResponse().ok(jobs.map((x) => new DangKyHocPhanTuDongJob(x).toClient())));
  }));

  return router;
};
