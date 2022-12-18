/* eslint-disable no-param-reassign */

export default (origin, target) => {
  if (target) {
    for (const key of Object.keys(origin)) {
      const newValue = target[key];
      if (newValue !== undefined && newValue !== null) {
        origin[key] = newValue;
      }
    }
  }
  return origin;
};
