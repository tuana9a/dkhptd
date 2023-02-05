import { QPipe } from "./q.pipe";

describe("QPipe", () => {
  it("create an instance", () => {
    const pipe = new QPipe();
    expect(pipe).toBeTruthy();
  });
});
