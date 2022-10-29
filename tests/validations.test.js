const isValidClassIds = require("../app/validations/isValidClassIds");
const isValidCttSisUsername = require("../app/validations/isValidCttSisUsername");
const isValidHocKy = require("../app/validations/isValidHocKy");

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
    expect(isValidHocKy(null)).toBeFalsy();
  });

  test("hoc ky is undefined", () => {
    expect(isValidHocKy(undefined)).toBeFalsy();
  });

  test("hoc ky is empty", () => {
    expect(isValidHocKy("")).toBeFalsy();
  });

  test("hoc ky is not started with number", () => {
    expect(isValidHocKy("notanumber1234a")).toBeFalsy();
  });

  test("hoc ky is valid", () => {
    expect(isValidHocKy("20192")).toBeTruthy();
  });
});
