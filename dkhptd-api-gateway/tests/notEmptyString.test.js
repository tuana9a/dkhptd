/* eslint-disable @typescript-eslint/no-var-requires */
const { default: EmptyStringError } = require("../dist/exceptions/EmptyStringError");
const { default: notEmptyString } = require("../dist/requires/notEmptyString");

describe("notEmptyString", () => {
  test("", () => {
    expect(() => notEmptyString("name", "")).toThrow(EmptyStringError);
  });

  test("only spaces", () => {
    expect(() => notEmptyString("name", "       ")).toThrow(EmptyStringError);
  });

  test("one space", () => {
    expect(() => notEmptyString("name", " ")).toThrow(EmptyStringError);
  });

  test("one tabs", () => {
    expect(() => notEmptyString("name", "\t\t\t\t\t")).toThrow(EmptyStringError);
  });

  test("mix tabs and space", () => {
    expect(() => notEmptyString("name", "\t  \t  ")).toThrow(EmptyStringError);
  });
});