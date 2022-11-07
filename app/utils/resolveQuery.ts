import Query from "../payloads/Query";

const regex = /(\w+\s*)(==|>=|<=|!=|\*=|>|<)(.*)/;

export default (str: string) => {
  const matcher = str.match(regex);
  return new Query(matcher[1], matcher[2], matcher[3]);
};
