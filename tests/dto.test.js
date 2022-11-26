/* eslint-disable @typescript-eslint/no-var-requires */
const SetProp = require("../dist/modifiers/SetProp").default;
const JobStatus = require("../dist/configs/JobStatus").default;
const NormalizeArrayProp = require("../dist/modifiers/NormalizeArrayProp").default;
const NormalizeIntProp = require("../dist/modifiers/NormalizeIntProp").default;
const NormalizeStringProp = require("../dist/modifiers/NormalizeStringProp").default;
const ObjectModifer = require("../dist/modifiers/ObjectModifier").default;
const PickProps = require("../dist/modifiers/PickProps").default;

describe("dto", () => {
  test("NewDangKyHocPhanTuDongJob", () => {
    const now = new Date();
    const received = new ObjectModifer({
      propWillBeDrop: "hello",
      username: "u ",
      password: " p  ",
      timeToStart: now.getTime(),
      actionId: "getStudentTimetable  ",
      status: "this status will be drop",
      created: "this created will be drop too",
    }).modify(PickProps(["username", "password", "classIds", "timeToStart"]))
      .modify(NormalizeStringProp("username"))
      .modify(NormalizeStringProp("password"))
      .modify(NormalizeArrayProp("classIds", "string", ""))
      .modify(NormalizeIntProp("timeToStart"))
      .modify(SetProp("createdAt", now.getTime()))
      .modify(SetProp("status", JobStatus.READY))
      .collect();

    expect(received).toEqual({
      username: "u",
      password: "p",
      timeToStart: now.getTime(),
      status: JobStatus.READY,
      createdAt: now.getTime(),
      classIds: []
    });
  });
});
