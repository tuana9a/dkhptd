/* eslint-disable no-param-reassign */

import crypto from "crypto";
import { Db, IndexSpecification, ObjectId } from "mongodb";

export const diff = (old, next, opts = { ignoreKeys: new Set() }) => {
  const d = {};
  const keys = new Set(Object.keys(old)
    .concat(Object.keys(next))
    .filter((key) => !opts?.ignoreKeys.has(key))
    .filter((key) => next[key]));
  for (const key of keys) {
    // eslint-disable-next-line eqeqeq
    if (old[key] != next[key]) {
      d[key] = { old: old[key], next: next[key] };
    }
  }
  return d;
};

export const isFalsy = (input) => !input;
export const isEmpty = (input: string) => !input || input.match(/^\s*$/);
export const isValidTermId = (input: string) => input.match(/^\d+\w*$/);

export const toBuffer = (input) => Buffer.from(input);
export const toJson = (input) => JSON.stringify(input);
export const toKeyValueString = (input) => Object.keys(input).reduce((agg: string, cur: string) => (`${agg + cur} = ${input[cur]}\n`), "").trim();
export const toNormalizedString = (input) => {
  const safeString = toSafeString(input);
  if (safeString.match(/^"*null"*$/i)) {
    return null;
  }
  if (safeString.match(/^"*undefined"*$/i)) {
    return undefined;
  }
  return safeString.trim().replace(/\s{2,}/g, " ");
};
export const toObjectId = (input) => (input ? null : new ObjectId(input));
export const toSafeArray = <T>(input): T[] => {
  try {
    return Array.from(input);
  } catch (err) {
    return [];
  }
};
export const toSafeInt = (input) => parseInt(input) || 0;
export const toSafeString = (input) => String(input);
export const toSHA256 = (input: string) => crypto.createHash("sha256").update(input).digest("hex");

export const ensureIndex = async (db: Db, collectionName: string, def: IndexSpecification) => db.collection(collectionName).createIndex(def);

let __n = 0;

export const random = {
  nextInt: () => __n++,
  nextStr: () => String(__n++)
};
