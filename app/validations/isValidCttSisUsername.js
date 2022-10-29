module.exports = (username) => {
  if (!username) return false;
  if (username.length < 8) return false;
  if (username.match(/^\s+$/)) return false;
  return true;
};
