const jwt = require("jsonwebtoken");
const logger = require("../loggers/logger");

module.exports = (secret) => (req, res, next) => {
  const token = req.headers.authorization || req.headers.Authorization;
  if (token == null) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, secret, (err, subject) => {
    if (err) {
      logger.info(`Reject [${err.message}] [${req.method}] ${req.path}`);
      res.sendStatus(403);
      return;
    }

    logger.info(`Authenticated [${subject.id}] [${req.method}] ${req.path}`);
    req.__accountId = subject.id;
    next();
  });
};
