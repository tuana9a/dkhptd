/* eslint-disable @typescript-eslint/no-var-requires */
const { default: NotAnArrayError } = require("../dist/exceptions/NotAnArrayError");

const requireArray = require("../dist/requires/requireArray").default;
const requireTypeOf = require("../dist/requires/requireTypeOf").default;
const TypeMismatchError = require("../dist/exceptions/TypeMismatchError").default;

describe("requireArray", () => {
  test("string", () => {
    expect(() => requireArray("name", "")).toThrow(NotAnArrayError);
  });

  test("number", () => {
    expect(() => requireArray("name", 10)).toThrow(NotAnArrayError);
  });

  test("empty array", () => {
    expect(() => requireArray("name", [])).not.toThrow();
  });

  test("array of numbers", () => {
    expect(() => requireArray("name", [1, 2, 3])).not.toThrow();
  });

  test("array of mix numbers and strings", () => {
    expect(() => requireArray("name", [1, "2", 3])).not.toThrow();
  });

  test("array of mix numbers and strings", () => {
    expect(() => requireArray("name", [1, "2", 3], [requireTypeOf("number")])).toThrow(TypeMismatchError);
  });

  test("array of mix numbers and strings", () => {
    expect(() => requireArray("name", [1, 2, 3], [requireTypeOf("number")])).not.toThrow();
  });
});