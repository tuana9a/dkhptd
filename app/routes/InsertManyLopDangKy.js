const express = require("express");
const BaseResponse = require("../payloads/BaseResponse");
const ExceptionHandler = require("./ExceptionHandler");
const SecretAuth = require("../middlewares/SecretAuth");
const config = require("../config");
const isFalsy = require("../validations/isFalsy");
const MissingRequestBodyDataError = require("../exceptions/MissingRequestBodyDataError");
const NotAndArrayError = require("../exceptions/NotAnArrayError");
const LopDangKy = require("../entities/LopDangKy");
const ObjectModifer = require("../modifiers/ObjectModifier");
const PickProps = require("../modifiers/PickProps");
const SetProp = require("../dto/SetProp");
const isValidHocKy = require("../validations/isValidHocKy");
const InvalidHocKyError = require("../exceptions/InvalidHocKyError");

module.exports = (db, collectionName) => {
  const router = express.Router();

  router.post("/api/lop-dang-kys", SecretAuth(config.SECRET), ExceptionHandler(async (req, resp) => {
    const data = req.body?.data;
    if (isFalsy(data)) {
      throw new MissingRequestBodyDataError();
    }

    if (!Array.isArray(data)) {
      throw new NotAndArrayError(data);
    }

    const lopDangKysToInsert = [];
    const result = [];
    for (const entry of data) {
      try {
        const lopDangKyConstruct = new ObjectModifer([
          PickProps([
            "MaLop",
            "MaLopKem",
            "MaHocPhan",
            "TenHocPhan",
            "LoaiLop",
            "BuoiHocSo",
            "HocVaoThu",
            "ThoiGianHoc",
            "PhongHoc",
            "HocVaoCacTuan",
            "GhiChu",
            "HocKy",
          ]),
          SetProp("createdAt", Date.now()),
        ]).apply(entry);

        const lopDangKy = new LopDangKy(lopDangKyConstruct);

        if (!isValidHocKy(lopDangKy.HocKy)) {
          throw new InvalidHocKyError(lopDangKy.HocKy);
        }
        lopDangKysToInsert.push(lopDangKy);
        result.push(new BaseResponse().ok(lopDangKy));
      } catch (err) {
        if (err.__isInvalidValueError) {
          result.push(new BaseResponse().failed(err.value).withMessage(err.message));
        } else {
          result.push(new BaseResponse().failed(err).withMessage(err.message));
        }
      }
    }

    await db.collection(collectionName).insertMany(lopDangKysToInsert);
    resp.send(new BaseResponse().ok(result));
  }));

  return router;
};
