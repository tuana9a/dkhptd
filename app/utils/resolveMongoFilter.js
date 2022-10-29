/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */

const Query = require("../payloads/Query");
const resolveQuery = require("./resolveQuery");

/**
 * @param {Query} query
 */
const resolveFirst = (agg, query) => {
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

/**
 * @param {Query} query
 */
const resolveExisted = (agg, query) => {
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

module.exports = (queries = []) => queries.map((x) => resolveQuery(x)).filter((x) => x.isValid()).reduce((filter, x) => {
  const existed = filter[x.key];
  if (existed) {
    resolveFirst(filter, x);
  } else {
    resolveExisted(filter, x);
  }
  return filter;
}, {});
