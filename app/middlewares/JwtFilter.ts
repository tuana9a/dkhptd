import { Handler } from "express";
import jwt from "jsonwebtoken";
import logger from "../loggers/logger";
import setRequestAccountId from "../utils/setRequestAccountId";

export default (secret: string): Handler => (req, res, next) => {
  const token = req.headers.authorization || (req.headers.Authorization as string);
  if (token == null) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, secret, (err, subject: { id: string }) => {
    if (err) {
      logger.info(`Reject [${err.message}] [${req.method}] ${req.path}`);
      res.sendStatus(403);
      return;
    }

    logger.info(`Authenticated [${subject.id}] [${req.method}] ${req.path}`);
    setRequestAccountId(req)(subject.id);
    next();
  });
};
