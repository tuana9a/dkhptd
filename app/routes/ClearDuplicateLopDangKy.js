/* eslint-disable camelcase */

const express = require("express");
const SecretAuth = require("../middlewares/SecretAuth");
const BaseResponse = require("../payloads/BaseResponse");
const ExceptionHandler = require("./ExceptionHandler");
const config = require("../config");

module.exports = (db, collectionName) => {
  const router = express.Router();
  router.delete("/api/duplicate-lop-dang-kys", SecretAuth(config.SECRET), ExceptionHandler(async (req, resp) => {
    const cursor = db.collection(collectionName).find();
    const ids = new Set();
    const delimiter = "::";
    let deletedCount = 0;

    while (await cursor.hasNext()) {
      const lopDangKy = await cursor.next();
      const { MaLop, BuoiHocSo, HocKy } = lopDangKy;
      ids.add([HocKy, MaLop, BuoiHocSo].join(delimiter));
    }

    for (const id of ids) {
      const [HocKy, MaLop, BuoiHocSo] = id.split(delimiter);
      const lopDangKyMoiNhat = await db.collection(collectionName).findOne({ MaLop, BuoiHocSo, HocKy }).sort({ createdAt: -1 });
      const lopDangKyMoiNhat_createdAt = lopDangKyMoiNhat.createdAt;
      const deleteResult = await db.collection(collectionName).deleteMany({ MaLop, BuoiHocSo, HocKy, createdAt: { $ne: lopDangKyMoiNhat_createdAt } });
      deletedCount += deleteResult.deletedCount;
    }

    resp.send(new BaseResponse().ok(deletedCount));
  }));
  return router;
};
