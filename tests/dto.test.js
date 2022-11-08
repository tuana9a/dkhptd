const SetProp = require("../dist/dto/SetProp").default;
const JobStatus = require("../dist/entities/JobStatus").default;
const NormalizeArrayProp = require("../dist/modifiers/NormalizeArrayProp").default;
const NormalizeIntProp = require("../dist/modifiers/NormalizeIntProp").default;
const NormalizeStringProp = require("../dist/modifiers/NormalizeStringProp").default;
const ObjectModifer = require("../dist/modifiers/ObjectModifier").default;
const PickProps = require("../dist/modifiers/PickProps").default;
const extractClassIds = require("../dist/utils/extractClassIds").default;

describe("dto", () => {
  test("NewDangKyHocPhanTuDongJob", () => {
    const now = new Date();
    const received = new ObjectModifer([
      PickProps(["username", "password", "classIds", "timeToStart"]),
      NormalizeStringProp("username"),
      NormalizeStringProp("password"),
      NormalizeArrayProp("classIds", "string", ""),
      NormalizeIntProp("timeToStart"),
      SetProp("createdAt", now.getTime()),
      SetProp("status", JobStatus.READY),
    ]).apply({
      propWillBeDrop: "hello",
      username: "u ",
      password: " p  ",
      timeToStart: now.getTime(),
      actionId: "getStudentTimetable  ",
      status: "this status will be drop",
      created: "this created will be drop too",
    });

    const expected = {
      username: "u",
      password: "p",
      timeToStart: now.getTime(),
      status: JobStatus.READY,
      createdAt: now.getTime(),
    };
    expect(received).toEqual(expected);
  });

  test("extract class ids like I wanted", () => {
    expect(extractClassIds("1,2,3,4")).toEqual(["1", "2", "3", "4"]);
    expect(extractClassIds(" 1, 2 ,  3 ,  4  ")).toEqual(["1", "2", "3", "4"]);
    expect(extractClassIds("1,,3,4")).toEqual(["1", "3", "4"]);
  });
});
