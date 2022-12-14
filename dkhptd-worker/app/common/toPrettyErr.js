module.exports = (err) => ({
  name: err.name,
  message: err.message,
  stack: err.stack.split("\n"),
});
