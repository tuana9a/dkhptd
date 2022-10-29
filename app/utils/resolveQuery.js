const Query = require("../payloads/Query");

const regex = /(\w+\s*)(==|>=|<=|!=|\*=|>|<)(.*)/;

module.exports = (str) => {
  const matcher = str.match(regex);
  return new Query(matcher[1], matcher[2], matcher[3]);
};
