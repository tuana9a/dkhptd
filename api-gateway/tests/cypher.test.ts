import crypto from "crypto";
import { c } from "../src/cypher";

describe("cypher", () => {
  test("c then d success", () => {
    const origin = "tuandeptraivodich";
    const secret = crypto.randomBytes(32).toString("hex"); // aes-256
    const iv = crypto.randomBytes(16).toString("hex");
    const encrypted = c(secret).iv(iv).encrypt(origin);
    expect(c(secret).iv(iv).decrypt(encrypted)).toBe(origin);
  });
});
