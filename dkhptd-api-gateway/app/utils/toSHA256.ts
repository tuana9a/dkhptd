import crypto from "crypto";

export default (input: string) => crypto.createHash("sha256").update(input).digest("hex");
