import { isEmpty } from "../app/utils";

describe("isEmpty", () => {
  test("", () => {
    expect(isEmpty("")).toBeTruthy();
  });

  test("one space", () => {
    expect(isEmpty(" ")).toBeTruthy();
  });

  test("many spaces", () => {
    expect(isEmpty("       ")).toBeTruthy();
  });

  test("many tabs", () => {
    expect(isEmpty("\t\t\t\t\t")).toBeTruthy();
  });

  test("mix tabs and space", () => {
    expect(isEmpty("\t  \t  ")).toBeTruthy();
  });
});