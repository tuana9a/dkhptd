const BaseResponse = require("../payloads/BaseResponse");

module.exports = (secret) => (req, resp, next) => {
  const token = req.headers.authorization;
  if (!token || token !== secret) {
    resp.status(403).send(new BaseResponse().failed().withMessage("ACCESS_DENINED"));
    return;
  }
  next();
};
