const logger = require("../loggers/logger");
const BaseResponse = require("../payloads/BaseResponse");

module.exports = (handler) => async (req, resp) => {
  try {
    await handler(req, resp);
  } catch (err) {
    if (err.__isSafeError) {
      resp.status(200).send(err.toBaseResponse());
      return;
    }
    logger.error(err);
    resp.status(500).send(new BaseResponse().failed(err).withMessage(err.message));
  }
};
