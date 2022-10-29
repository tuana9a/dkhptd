const toNormalizedString = require("../dto/toNormalizedString");
const toSafeInt = require("../dto/toSafeInt");
const toSafeString = require("../dto/toSafeString");
const EntityWithObjectId = require("./EntityWithObjectId");

class LopDangKy extends EntityWithObjectId {
  constructor({
    _id,
    MaLop,
    MaLopKem,
    LoaiLop,
    MaHocPhan,
    TenHocPhan,
    BuoiHocSo,
    HocVaoThu,
    ThoiGianHoc,
    PhongHoc,
    HocVaoCacTuan,
    GhiChu,
    HocKy,
    createdAt,
  }) {
    super();
    this._id = _id;
    this.MaLop = toSafeString(MaLop);
    this.MaLopKem = toSafeString(MaLopKem);
    this.LoaiLop = toSafeString(LoaiLop);
    this.MaHocPhan = toSafeString(MaHocPhan);
    this.TenHocPhan = toSafeString(TenHocPhan);
    this.BuoiHocSo = toSafeInt(BuoiHocSo);
    this.HocVaoThu = toSafeInt(HocVaoThu);
    this.ThoiGianHoc = toNormalizedString(ThoiGianHoc);
    this.PhongHoc = toNormalizedString(PhongHoc);
    this.HocVaoCacTuan = toNormalizedString(HocVaoCacTuan);
    this.GhiChu = toNormalizedString(GhiChu);
    this.HocKy = toNormalizedString(HocKy);
    this.createdAt = createdAt;
  }
}

module.exports = LopDangKy;
