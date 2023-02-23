/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */

import { Filter, ObjectId } from "mongodb";
import _ from "lodash";

export const merinCfg = {
  regexFlags: "i",
};

export const auto = (value) => {
  let output = value;
  try {
    if (value.match(/^\d+$/)) {
      output = parseInt(value);
    } else if (ObjectId.isValid(value)) {
      output = new ObjectId(value);
    }
  } catch (ignored) {
    //
  }
  return output;
};

export class Query {
  key: string;
  operator: string;
  value;

  constructor(key: string, operator: string, value: string) {
    this.key = key;
    this.operator = operator;
    this.value = auto(value);
  }
}

export const isValidQuery = (q: Query) => q.key && q.operator;

export const regex = /(\w+\s*)(==|>=|<=|!=|\*=|>|<)(.*)/;

export const resolveQuery = (str: string) => {
  const matcher = str.match(regex);
  if (matcher) {
    return new Query(matcher[1], matcher[2], matcher[3]);
  }
  return new Query(null, null, null);
};

export const aggregate = <T>(filter: Filter<T>, query: Query) => {
  if (query.operator == "==") {
    _.set(filter, `${query.key}`, query.value);
  } else if (query.operator == "!=") {
    _.set(filter, `${query.key}.$ne`, query.value);
  } else if (query.operator == ">") {
    _.set(filter, `${query.key}.$gt`, query.value);
  } else if (query.operator == "<") {
    _.set(filter, `${query.key}.$lt`, query.value);
  } else if (query.operator == ">=") {
    _.set(filter, `${query.key}.$gte`, query.value);
  } else if (query.operator == "<=") {
    _.set(filter, `${query.key}.$lte`, query.value);
  } else if (query.operator == "*=") {
    _.set(filter, `${query.key}.$regex`, new RegExp(query.value, merinCfg.regexFlags));
  }
  return filter;
};

export const resolveMongoFilter = <T>(queries: string[] = []): Filter<T> => queries.map((x) => resolveQuery(x)).filter((x) => isValidQuery(x)).reduce(aggregate, {});
