import Query from "../payloads/Query";

const regex = /(\w+\s*)(==|>=|<=|!=|\*=|>|<)(.*)/;

export default (str: string) => {
  const matcher = str.match(regex);
  if (matcher) { return new Query(matcher[1], matcher[2], matcher[3]); }
  return new Query(null, null, null);
};
