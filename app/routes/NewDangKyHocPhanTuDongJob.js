const express = require("express");
const isValidCttSisUsername = require("../validations/isValidCttSisUsername");
const isValidCttSisPassword = require("../validations/isValidCttSisPassword");
const isValidClassIds = require("../validations/isValidClassIds");
const MissingRequestBodyDataError = require("../exceptions/MissingRequestBodyDataError");
const NotAndArrayError = require("../exceptions/NotAnArrayError");
const ObjectModifer = require("../modifiers/ObjectModifier");
const NormalizeArrayProp = require("../modifiers/NormalizeArrayProp");
const NormalizeIntProp = require("../modifiers/NormalizeIntProp");
const NormalizeStringProp = require("../modifiers/NormalizeStringProp");
const PickProps = require("../modifiers/PickProps");
const DangKyHocPhanTuDongJob = require("../entities/DangKyHocPhanTuDongJob");
const JobStatus = require("../entities/JobStatus");
const InvalidCttSisUsernameError = require("../exceptions/InvalidCttSisUsernameError");
const InvalidCttSisPassswordError = require("../exceptions/InvalidCttSisPassswordError");
const InvalidClassIdsError = require("../exceptions/InvalidClassIdsError");
const SetProp = require("../dto/SetProp");
const BaseResponse = require("../payloads/BaseResponse");
const ExceptionHandler = require("./ExceptionHandler");
const RateLimit = require("../middlewares/RateLimit");
const isFalsy = require("../validations/isFalsy");

module.exports = (db, collectionName) => {
  const router = express.Router();
  router.post("/dkhptd-s", RateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), ExceptionHandler(async (req, resp) => {
    const data = req.body?.data;
    if (isFalsy(data)) {
      throw new MissingRequestBodyDataError();
    }

    if (!Array.isArray(data)) {
      throw new NotAndArrayError(data);
    }

    const result = [];
    const jobsToInsert = [];

    for (const entry of data) {
      try {
        const jobConstruct = new ObjectModifer([
          PickProps(["username", "password", "classIds", "timeToStart"]),
          NormalizeStringProp("username"),
          NormalizeStringProp("password"),
          NormalizeArrayProp("classIds", "string", ""),
          NormalizeIntProp("timeToStart"),
          SetProp("createdAt", Date.now()),
          SetProp("status", JobStatus.READY),
          // TODO: inject ownerAccountId
        ]).apply(entry);

        const job = new DangKyHocPhanTuDongJob(jobConstruct);

        if (!isValidCttSisUsername(job.username)) {
          throw new InvalidCttSisUsernameError(job.username);
        }

        if (!isValidCttSisPassword(job.password)) {
          throw new InvalidCttSisPassswordError(job.password);
        }

        if (!isValidClassIds(job.classIds)) {
          throw new InvalidClassIdsError(job.classIds);
        }

        jobsToInsert.push(job);
        result.push(new BaseResponse().ok(job));
      } catch (err) {
        if (err.__isInvalidValueError) {
          result.push(new BaseResponse().failed(err.value).withMessage(err.message));
        } else {
          result.push(new BaseResponse().failed(err).withMessage(err.message));
        }
      }
    }

    await db.collection(collectionName).insertMany(jobsToInsert);
    resp.send(new BaseResponse().ok(result));
  }));

  router.post("/dkhptd", RateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), ExceptionHandler(async (req, resp) => {
    const data = req.body?.data;
    if (!data) {
      throw new MissingRequestBodyDataError();
    }

    if (!Array.isArray(data)) {
      throw new NotAndArrayError(data);
    }

    const jobConstruct = new ObjectModifer([
      PickProps(["username", "password", "classIds", "timeToStart"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
      NormalizeArrayProp("classIds", "string", ""),
      NormalizeIntProp("timeToStart"),
      SetProp("createdAt", Date.now()),
      SetProp("status", JobStatus.READY),
      // TODO: inject ownerAccountId
    ]).apply(data);

    const job = new DangKyHocPhanTuDongJob(jobConstruct);

    if (!isValidCttSisUsername(job.username)) {
      throw new InvalidCttSisUsernameError(job.username);
    }

    if (!isValidCttSisPassword(job.password)) {
      throw new InvalidCttSisPassswordError(job.password);
    }

    if (!isValidClassIds(job.classIds)) {
      throw new InvalidClassIdsError(job.classIds);
    }

    await db.collection(collectionName).insertOne(job);
    resp.send(new BaseResponse().ok(job));
  }));

  return router;
};
