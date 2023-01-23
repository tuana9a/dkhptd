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

export const isEmpty = (input: string) => input && input.match(/^\s*$/);

export const isValidTermId = (input: string) => input.match(/^\d+\w*$/);

export const getPrettyLoadedRoutes = (input) => {
  const r = (o, previousPath: string) => {
    const result = [];
    const keys = Object.keys(o);
    for (const key of keys) {
      if (typeof o[key] == "string") {
        result.push({ path: `${previousPath}/${key}`, m: o[key] });
      } else {
        const nestedResult = r(o[key], `${previousPath}/${key}`);
        result.push(...nestedResult);
      }
    }
    return result;
  };
  return r(input, "");
};