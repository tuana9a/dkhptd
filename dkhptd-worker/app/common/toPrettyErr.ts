export default (err: Error) => ({
  name: err.name,
  message: err.message,
  stack: err.stack.split("\n"),
});
