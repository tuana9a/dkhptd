const isValidClassIds = require("../dist/validations/isValidClassIds").default;
const isValidCttSisUsername = require("../dist/validations/isValidCttSisUsername").default;
const isValidTermId = require("../dist/validations/isValidTermId").default;

describe("validations", () => {
  test("username is null", () => {
    expect(isValidCttSisUsername(null)).toBeFalsy();
  });

  test("username is undefined", () => {
    expect(isValidCttSisUsername(undefined)).toBeFalsy();
  });

  test("username is empty", () => {
    expect(isValidCttSisUsername(10 * " ")).toBeFalsy();
  });

  test("username is good", () => {
    expect(isValidCttSisUsername("20183656")).toBeTruthy();
  });

  test("classIds is undefined", () => {
    expect(isValidClassIds(undefined)).toBeFalsy();
  });

  test("classIds is empty", () => {
    expect(isValidClassIds([])).toBeFalsy();
  });

  test("classIds is not type string", () => {
    expect(isValidClassIds([1234, 41234])).toBeFalsy();
  });

  test("classIds is not type string", () => {
    expect(isValidClassIds(["1234", 41234])).toBeFalsy();
  });

  test("hoc ky is null", () => {
    expect(isValidTermId(null)).toBeFalsy();
  });

  test("hoc ky is undefined", () => {
    expect(isValidTermId(undefined)).toBeFalsy();
  });

  test("hoc ky is empty", () => {
    expect(isValidTermId("")).toBeFalsy();
  });

  test("hoc ky is not started with number", () => {
    expect(isValidTermId("notanumber1234a")).toBeFalsy();
  });

  test("hoc ky is valid", () => {
    expect(isValidTermId("20192")).toBeTruthy();
  });
});
