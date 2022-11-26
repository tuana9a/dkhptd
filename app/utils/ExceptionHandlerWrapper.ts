import { Handler, NextFunction, Request, Response } from "express";
import logger from "../loggers/logger";
import BaseResponse from "../payloads/BaseResponse";

export default (handler: (req: Request, resp: Response, next?: NextFunction) => Promise<any>): Handler => async (req, resp, next) => {
  try {
    await handler(req, resp, next);
  } catch (err) {
    if (err.__isSafeError) {
      resp.status(200).send(err.toBaseResponse());
      return;
    }
    logger.error(err);
    resp.status(500).send(new BaseResponse().failed(err).msg(err.message));
  }
};
