module.exports = (password) => {
  if (!password) return false;
  if (password.match(/^\s+$/)) return false;
  return true;
};
