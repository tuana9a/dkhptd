import { ObjectId } from "mongodb";
import { resolveMongoFilter, auto } from "../src/merin";

describe("merin", () => {
  test("mix", () => {
    expect(resolveMongoFilter(["name==tuan", "age>18", "age<30"])).toEqual({
      name: "tuan",
      age: {
        $gt: 18,
        $lt: 30,
      }
    });
  });

  test("eq", () => {
    expect(resolveMongoFilter(["name==tuan"])).toEqual({ name: "tuan" });
  });

  test("ne", () => {
    expect(resolveMongoFilter(["name!=tuan"])).toEqual({ name: { $ne: "tuan" } });
  });

  test("gt", () => {
    expect(resolveMongoFilter(["age>18"])).toEqual({ age: { $gt: 18 } });
  });

  test("lt", () => {
    expect(resolveMongoFilter(["age<18"])).toEqual({ age: { $lt: 18 } });
  });

  test("gte", () => {
    expect(resolveMongoFilter(["age>=18"])).toEqual({ age: { $gte: 18 } });
  });

  test("lte", () => {
    expect(resolveMongoFilter(["age<=18"])).toEqual({ age: { $lte: 18 } });
  });

  test("regex", () => {
    expect(resolveMongoFilter(["name*=t"])).toEqual({ name: { $regex: new RegExp("t", "i") } });
  });

  test("auto number", () => {
    expect(auto("1234")).toEqual(1234);
  });

  test("auto object id", () => {
    const id = new ObjectId();
    expect(auto(id.toHexString())).toEqual(id);
  });
});
