export default (old, next, opts = { ignoreKeys: new Set() }) => {
  const diff = {};
  const keys = new Set(Object.keys(old)
    .concat(Object.keys(next))
    .filter((key) => !opts?.ignoreKeys.has(key))
    .filter((key) => next[key]));
  for (const key of keys) {
    // eslint-disable-next-line eqeqeq
    if (old[key] != next[key]) {
      diff[key] = { old: old[key], next: next[key] };
    }
  }
  return diff;
};
