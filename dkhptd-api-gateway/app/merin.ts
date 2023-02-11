/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */

import { ObjectId } from "mongodb";

export class Query {
  key: string;
  operator: string;
  value;

  constructor(key: string, operator: string, value: string) {
    this.key = key;
    this.operator = operator;
    try {
      if (value.match(/^\d+$/)) {
        this.value = parseInt(value);
      } else if (ObjectId.isValid(value)) {
        this.value = new ObjectId(value);
      } else {
        this.value = value;
      }
    } catch (err) {
      this.value = value;
    }
  }

  isValid() {
    return this.key && this.operator;
  }
}

const regex = /(\w+\s*)(==|>=|<=|!=|\*=|>|<)(.*)/;

export const resolveQuery = (str: string) => {
  const matcher = str.match(regex);
  if (matcher) { return new Query(matcher[1], matcher[2], matcher[3]); }
  return new Query(null, null, null);
};

export const resolveFirst = (agg: { [key: string]: object }, query: Query) => {
  if (query.operator == "!=") {
    agg[query.key] = { $ne: query.value };
  } else if (query.operator == ">") {
    agg[query.key] = { $gt: query.value };
  } else if (query.operator == "<") {
    agg[query.key] = { $lt: query.value };
  } else if (query.operator == ">=") {
    agg[query.key] = { $gte: query.value };
  } else if (query.operator == "<=") {
    agg[query.key] = { $lte: query.value };
  } else if (query.operator == "==") {
    agg[query.key] = query.value;
  } else if (query.operator == "*=") {
    agg[query.key] = { $regex: new RegExp(query.value) };
  }
};

export const resolveExisted = (agg: { [key: string]: object }, query: Query) => {
  if (query.operator == "==") {
    agg[query.key] = query.value;
  } else if (query.operator == ">") {
    agg[query.key] = { $gt: query.value };
  } else if (query.operator == "<") {
    agg[query.key] = { $lt: query.value };
  } else if (query.operator == ">=") {
    agg[query.key] = { $gte: query.value };
  } else if (query.operator == "<=") {
    agg[query.key] = { $lte: query.value };
  } else if (query.operator == "!=") {
    agg[query.key] = { $ne: query.value };
  } else if (query.operator == "*=") {
    agg[query.key] = { $regex: new RegExp(query.value, "i") /*default incase*/};
  }
};

export const resolveMongoFilter = (queries: string[] = []) => queries.map((x) => resolveQuery(x)).filter((x) => x.isValid()).reduce((filter, x) => {
  const existed = filter[x.key];
  if (existed) {
    resolveFirst(filter, x);
  } else {
    resolveExisted(filter, x);
  }
  return filter;
}, {});
