/* eslint-disable @typescript-eslint/no-var-requires */
// const { default: TypeMismatchError } = require("../dist/exceptions/TypeMismatchError");
const requireTypeOf = require("../dist/requires/requireTypeOf").default;
const requireNotFalsy = require("../dist/requires/requireNotFalsy").default;
// const FalsyValueError = require("../dist/exceptions/FalsyValueError").default;
const requireLength = require("../dist/requires/requireLength").default;
// const RequireLengthFailed = require("../dist/exceptions/RequireLengthFailed").default;
// const { default: EmptyStringError } = require("../dist/exceptions/EmptyStringError");
const { default: notEmptyString } = require("../dist/requires/notEmptyString");
const requireArray = require("../dist/requires/requireArray").default;
const requireValidTermId = require("../dist/requires/requireValidTermId").default;
const RequireMatchFailed = require("../dist/exceptions/RequireMatchFailed").default;

describe("validations", () => {
  test("username is good", () => {
    const job = { username: "20183656" };
    expect(() => {
      requireNotFalsy("job.username", job.username);
      notEmptyString("job.username", job.username);
      requireLength("job.username", job.username, x => x >= 8);
    }).not.toThrow();
  });

  test("password is good", () => {
    const job = { password: "20183656" };
    expect(() => {
      requireNotFalsy("job.password", job.password);
      notEmptyString("job.password", job.password);
    }).not.toThrow();
  });

  test("classIds is good", () => {
    const job = { classIds: ["1234", "4321"] };
    expect(() => {
      requireNotFalsy("job.classIds", job.classIds);
      requireLength("job.classIds", job.classIds, x => x > 0);
      requireArray("job.classIds", job.classIds, [requireTypeOf("string")]);
    }).not.toThrow();
  });

  test("termId is empty", () => {
    expect(() => {
      requireValidTermId("name", "");
    }).toThrow(RequireMatchFailed);
  });

  test("termId is not started with number", () => {
    expect(() => {
      requireValidTermId("name", "notanumber1234a");
    }).toThrow(RequireMatchFailed);
  });

  test("termId is valid", () => {
    expect(() => {
      requireValidTermId("name", "20192");
    }).not.toThrow(RequireMatchFailed);
  });
});
