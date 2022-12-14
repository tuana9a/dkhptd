import { Handler } from "express";
import jwt from "jsonwebtoken";
import BaseResponse from "../payloads/BaseResponse";

export default (secret: string): Handler => (req, res, next) => {
  const token = req.headers.authorization || (req.headers.Authorization as string);
  if (token == null) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, secret, (err, subject: { id: string }) => {
    if (err) {
      res.status(401).send(new BaseResponse().failed().msg(err.message));
      return;
    }

    req.__accountId = subject.id;
    next();
  });
};
