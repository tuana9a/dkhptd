/* eslint-disable no-param-reassign */

module.exports = (src, target) => {
  if (target) {
    for (const key of Object.keys(src)) {
      const newValue = target[key];
      if (newValue !== undefined && newValue !== null) {
        src[key] = newValue;
      }
    }
  }
  return src;
};
