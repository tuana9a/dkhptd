export default (password: string) => {
  if (!password) return false;
  if (password.match(/^\s+$/)) return false;
  return true;
};
