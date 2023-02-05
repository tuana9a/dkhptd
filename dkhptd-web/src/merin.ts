export interface Q {
  key: string;
  op: string;
  value: string;
}

export interface MatchQueryTemplate {
  displayName?: string;
  key: string;
  choices?: string[];
}

export const build = (listQ: Q[]) => {
  return listQ.map(x => [x.key, x.op, x.value].join("")).join(",");
};

const regex = /(\w+\s*)(==|>=|<=|!=|\*=|>|<)(.*)/;

export const parse = (str: string): Q => {
  const matcher = str.match(regex);
  if (matcher) { return { key: matcher[1], op: matcher[2], value: matcher[3] }; }
  return { key: "", op: "", value: "" };
};
