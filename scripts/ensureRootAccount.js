const crypto = require("crypto");
const { MongoClient } = require("mongodb");

require("dotenv").config();

const Role = {
  ADMIN: "ADMIN",
};

const CollectionName = {
  ACCOUNT: "account",
  CTR: "classToRegister",
  PREFERENCE: "preference",
  DKHPTD: "dkhptd",
  DKHPTDResult: "dkhptdResult",
  DKHPTDV1: "dkhptdV1",
  DKHPTDV1Result: "dkhptdV1Result",
  DKHPTDV2: "dkhptdV2",
  DKHPTDV2Result: "dkhptdV2Result",
  SETTINGS: "settings",
  SUBJECT: "subject",
};

const cfg = {
  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017",
  DATABASE_NAME: process.env.DATABASE_NAME || "dkhptd",
  INIT_ROOT_PASSWORD: process.env.INIT_ROOT_PASSWORD || crypto.randomBytes(32).toString("hex"),
};

const toSHA256 = (input) => crypto.createHash("sha256").update(input).digest("hex");

async function main() {
  const client = await new MongoClient(cfg.MONGODB_CONNECTION_STRING).connect();
  const password = cfg.INIT_ROOT_PASSWORD;

  await client
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .updateOne({ username: "root" }, { $set: { password: toSHA256(password), role: Role.ADMIN } });

  console.log(`ensure root account with password ${password}`);

  process.exit(0);
}

main();
