const BaseResponse = require("../payloads/BaseResponse");

module.exports = () => (req, resp, next) => {
  const token = req.headers.authorization;
  if (!token) {
    resp.status(403).send(new BaseResponse().failed().withMessage("ACCESS_DENINED"));
    return;
  }
  // TODO: decrypt jwt to accountId and set it to req
  next();
};
