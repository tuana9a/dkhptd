const express = require("express");
const { ObjectId } = require("mongodb");
const ObjectModifer = require("../modifiers/ObjectModifier");
const PickProps = require("../modifiers/PickProps");
const BaseResponse = require("../payloads/BaseResponse");
const ExceptionHandler = require("./ExceptionHandler");
const resolveFilter = require("../utils/resolveMongoFilter");
const toNormalizedString = require("../dto/toNormalizedString");
const isValidHocKy = require("../validations/isValidHocKy");
const InvalidHocKyError = require("../exceptions/InvalidHocKyError");

module.exports = (db, collectionName) => {
  const router = express.Router();

  router.get("/api/lop-dang-kys", ExceptionHandler(async (req, resp) => {
    const query = new ObjectModifer([
      PickProps(["MaLop", "MaLopKem", "LoaiLop", "MaHocPhan", "TenHocPhan", "BuoiHocSo", "HocVaoThu", "ThoiGianHoc", "PhongHoc", "HocVaoCacTuan", "HocKy"], { dropFalsy: true }),
    ]).apply(req.query);
    const hocKy = toNormalizedString(query.HocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = resolveFilter(String(query.q).split(","));
    filter.HocKy = hocKy;
    const lopDangKys = await db.collection(collectionName).find(filter).toArray();
    resp.send(new BaseResponse().ok(lopDangKys));
  }));

  router.get("/api/lop-dang-kys/:id", ExceptionHandler(async (req, resp) => {
    const id = toNormalizedString(req.params.id);
    const filter = { _id: new ObjectId(id) };
    const lopDangKy = await db.collection(collectionName).findOne(filter);
    resp.send(new BaseResponse().ok(lopDangKy));
  }));

  router.get("/api/lop-dang-kys/ma-lops", ExceptionHandler(async (req, resp) => {
    const maLops = toNormalizedString(req.query.maLops).split(",").map((x) => toNormalizedString(x));
    const hocKy = toNormalizedString(req.query.hocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = { MaLop: { $in: maLops }, HocKy: hocKy };
    const lopDangKys = await db.collection(collectionName).find(filter).toArray();
    resp.send(new BaseResponse().ok(lopDangKys));
  }));

  router.get("/api/lop-dang-kys/ma-lops/start-withs", ExceptionHandler(async (req, resp) => {
    const maLops = toNormalizedString(req.query.maLops).split(",").map((x) => toNormalizedString(x));
    const hocKy = toNormalizedString(req.query.hocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = {
      MaLop: {
        $or: maLops.map((maLop) => {
          const missing = 6 - String(maLop).length;
          if (missing === 0) {
            return { MaLop: maLop };
          }
          const delta = 10 ** missing;
          return { MaLop: { $gte: maLop * delta, $lte: maLop * delta + delta } };
        }),
      },
      HocKy: hocKy,
    };
    const lopDangKys = await db.collection(collectionName).find(filter).toArray();
    resp.send(new BaseResponse().ok(lopDangKys));
  }));

  router.get("/api/lop-dang-kys/ma-lops/:maLop", ExceptionHandler(async (req, resp) => {
    const maLop = toNormalizedString(req.params.maLop);
    const hocKy = toNormalizedString(req.query.hocKy);

    if (!isValidHocKy(hocKy)) {
      throw new InvalidHocKyError(hocKy);
    }

    const filter = { MaLop: maLop, HocKy: hocKy };
    const lopDangKy = await db.collection(collectionName).findOne(filter);
    resp.send(new BaseResponse().ok(lopDangKy));
  }));
  return router;
};
