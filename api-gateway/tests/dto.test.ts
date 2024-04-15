import { modify, m } from "../src/modifiers";
import { JobStatus } from "../src/cfg";

describe("dto", () => {
  test("DKHPTD", () => {
    const now = new Date();
    const received = modify({
      propWillBeDrop: "hello",
      username: "u ",
      password: " p  ",
      timeToStart: now.getTime(),
      actionId: "getStudentTimetable  ",
      status: "this status will be drop",
      created: "this created will be drop too",
    }, [
      m.pick(["username", "password", "classIds", "timeToStart"]),
      m.normalizeString("username"),
      m.normalizeString("password"),
      m.normalizeArray("classIds", "string"),
      m.normalizeInt("timeToStart"), m.set("createdAt", now.getTime()),
      m.set("status", JobStatus.READY)
    ]);

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
