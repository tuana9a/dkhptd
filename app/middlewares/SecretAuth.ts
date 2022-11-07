import { Handler } from "express";

export default (secret: string): Handler => (req, resp, next) => {
  const token = req.headers.authorization || req.headers.Authorization;
  if (!token || token !== secret) {
    resp.sendStatus(403);
    return;
  }
  next();
};
