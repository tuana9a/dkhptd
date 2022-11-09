/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */

import Query from "../payloads/Query";
import resolveQuery from "./resolveQuery";

const resolveFirst = (agg: { [key: string]: object }, query: Query) => {
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

const resolveExisted = (agg: { [key: string]: object }, query: Query) => {
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
    agg[query.key] = { $regex: new RegExp(query.value) };
  }
};

export default (queries: string[] = []) => queries.map((x) => resolveQuery(x)).filter((x) => x.isValid()).reduce((filter, x) => {
  const existed = filter[x.key];
  if (existed) {
    resolveFirst(filter, x);
  } else {
    resolveExisted(filter, x);
  }
  return filter;
}, {});
