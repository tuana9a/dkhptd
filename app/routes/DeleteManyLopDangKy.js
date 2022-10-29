const express = require("express");
const BaseResponse = require("../payloads/BaseResponse");
const ExceptionHandler = require("./ExceptionHandler");
const SecretAuth = require("../middlewares/SecretAuth");
const config = require("../config");
const ObjectModifer = require("../modifiers/ObjectModifier");
const PickProps = require("../modifiers/PickProps");
const isValidHocKy = require("../validations/isValidHocKy");
const InvalidHocKyError = require("../exceptions/InvalidHocKyError");
const toNormalizedString = require("../dto/toNormalizedString");
const resolveFilter = require("../utils/resolveMongoFilter");

module.exports = (db, collectionName) => {
  const router = express.Router();

  router.delete("/api/lop-dang-kys", SecretAuth(config.SECRET), ExceptionHandler(async (req, resp) => {
    const query = new ObjectModifer([
      PickProps(["MaLop", "MaLopKem", "LoaiLop", "MaHocPhan", "TenHocPhan", "BuoiHocSo", "HocVaoThu", "ThoiGianHoc", "PhongHoc", "HocVaoCacTuan", "HocKy"], { dropFalsy: true }),
    ]).apply(req.query);
    const hocKy = toNormalizedString(query.HocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = resolveFilter(String(query.q).split(","));
    filter.HocKy = hocKy;
    const deleteResult = await db.collection(collectionName).deleteMany(filter);
    resp.send(new BaseResponse().ok(deleteResult.deletedCount));
  }));

  return router;
};
