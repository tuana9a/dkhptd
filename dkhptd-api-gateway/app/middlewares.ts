import { Request, Response, Handler, NextFunction } from "express";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cfg, Role } from "./cfg";
import { mongoConnectionPool } from "./connections";
import { Account } from "./entities";
import BaseResponse from "./payloads/BaseResponse";
import logger from "./loggers/logger";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ratelimit = require("express-rate-limit");

export const RateLimit = ({ windowMs, max, handler }: { windowMs: number; max: number, handler?: Handler }) => ratelimit({
  windowMs: windowMs,
  max: max,
  handler: handler,
});

export const JwtFilter = (secret: string): Handler => (req, res, next) => {
  const token = req.headers.authorization || (req.headers.Authorization as string);
  if (token == null) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, secret, (err, subject: { id: string }) => {
    if (err) {
      res.status(401).send(new BaseResponse().failed().m(err.message));
      return;
    }

    req.__accountId = subject.id;
    next();
  });
};

export const IsAdminFilter = (): Handler => async (req, resp, next) => {
  const accountId = req.__accountId;
  const doc = await mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(Account.name).findOne({ _id: new ObjectId(accountId) });
  const account = new Account(doc);
  if (String(account.role).toUpperCase() == Role.ADMIN) {
    return next();
  }
  resp.sendStatus(403);
};

export const InjectTermId = (): Handler => async (req, resp, next) => {
  req.__termId = req.params.termId;
  next();
};

export const ExceptionWrapper = (handler: (req: Request, resp: Response, next?: NextFunction) => Promise<unknown>): Handler => async (req, resp, next) => {
  try {
    await handler(req, resp, next);
  } catch (err) {
    if (err.__isSafeError) {
      resp.status(200).send(err.toBaseResponse());
      return;
    }
    logger.error(err);
    resp.status(500).send(new BaseResponse().failed(err).m(err.message));
  }
};
