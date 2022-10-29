const BaseResponse = require("../payloads/BaseResponse");

module.exports = (handler) => async (req, resp) => {
  try {
    await handler(req, resp);
  } catch (err) {
    if (err.__isInvalidValueError) {
      resp.status(400).send(new BaseResponse().failed(err.value).withMessage(err.message));
      return;
    }
    resp.status(500).send(new BaseResponse().failed(err).withMessage(err.message));
  }
};
