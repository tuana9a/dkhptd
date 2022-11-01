const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const BaseResponse = require("../payloads/BaseResponse");
const ExceptionHandler = require("./ExceptionHandler");
const config = require("../config");
const LoginWithUsernamePasswordRequest = require("../payloads/LoginWithUsernamePasswordRequest");
const ObjectModifer = require("../modifiers/ObjectModifier");
const PickProps = require("../modifiers/PickProps");
const NormalizeStringProp = require("../modifiers/NormalizeStringProp");
const Account = require("../entities/Account");
const UsernameExistedError = require("../exceptions/UsernameExistedError");
const ReplaceCurrentPropValueWith = require("../modifiers/ReplaceCurrentPropValueWith");
const LoginResponse = require("../payloads/LoginResponse");

module.exports = (db, collectionName) => {
  const router = express.Router();
  router.post("/api/login", ExceptionHandler(async (req, resp) => {
    const body = new LoginWithUsernamePasswordRequest(new ObjectModifer([
      PickProps(["username", "password"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
    ]).apply(req.body));
    const hashedPassword = crypto.createHash("sha256").update(body.password).digest("hex");
    const record = await db.collection(collectionName).findOne({ username: body.username, password: hashedPassword });
    const account = new Account(record).withId(record._id);
    const token = jwt.sign({ id: account._id }, config.SECRET, { expiresIn: "1h" });
    resp.send(new BaseResponse().ok(new LoginResponse(token)));
  }));

  router.post("/api/signup", ExceptionHandler(async (req, resp) => {
    const body = new LoginWithUsernamePasswordRequest(new ObjectModifer([
      PickProps(["username", "password"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
      ReplaceCurrentPropValueWith("password", (oldValue) => crypto.createHash("sha256").update(oldValue).digest("hex")),
    ]).apply(req.body));
    const isUsernameExists = await db.collection(collectionName).findOne({ username: body.username });
    if (isUsernameExists) {
      throw new UsernameExistedError(body.username);
    }
    const account = new Account(body);
    await db.collection(collectionName).insertOne(account);
    resp.send(new BaseResponse().ok(account.toClient()));
  }));
  return router;
};
