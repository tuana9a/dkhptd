/* eslint-disable @typescript-eslint/no-var-requires */

const { default: TypeMismatchError } = require("../dist/exceptions/TypeMismatchError");
const requireTypeOf = require("../dist/requires/requireTypeOf").default;
const requireNotFalsy = require("../dist/requires/requireNotFalsy").default;
const FalsyValueError = require("../dist/exceptions/FalsyValueError").default;
const requireLength = require("../dist/requires/requireLength").default;
const RequireLengthFailed = require("../dist/exceptions/RequireLengthFailed").default;

describe("requires", () => {
  test("type of string", () => {
    expect(() => {
      requireTypeOf("string")("name", "string");
    }).not.toThrow();
  });

  test("type of string", () => {
    expect(() => {
      requireTypeOf("string")("name", "");
    }).not.toThrow();
  });

  test("type of string", () => {
    expect(() => {
      requireTypeOf("string")("name", 1);
    }).toThrow(TypeMismatchError);
  });

  test("type of number", () => {
    expect(() => {
      requireTypeOf("number")("name", "string");
    }).toThrow(TypeMismatchError);
  });

  test("type of number", () => {
    expect(() => {
      requireTypeOf("number")("name", 1);
    }).not.toThrow();
  });

  test("fasly", () => {
    expect(() => {
      requireNotFalsy("name", null);
    }).toThrow(FalsyValueError);
  });

  test("fasly", () => {
    expect(() => {
      requireNotFalsy("name", undefined);
    }).toThrow(FalsyValueError);
  });

  test("fasly", () => {
    expect(() => {
      requireNotFalsy("name", "");
    }).toThrow(FalsyValueError);
  });

  test("length > 8", () => {
    expect(() => {
      requireLength("name", "12341234", x => x > 8);
    }).toThrow(RequireLengthFailed);
  });

  test("length == 8", () => {
    expect(() => {
      requireLength("name", "12341234", x => x == 8);
    }).not.toThrow(RequireLengthFailed);
  });

  test("length <= 8", () => {
    expect(() => {
      requireLength("name", "12341234", x => x <= 8);
    }).not.toThrow(RequireLengthFailed);
  });

  test("length <= 8", () => {
    expect(() => {
      requireLength("name", "123412341234", x => x <= 8);
    }).toThrow(RequireLengthFailed);
  });
});
