module.exports = (input) => {
  const keys = Object.keys(input);
  return keys.reduce((agg, cur) => (`${agg + cur} = ${input[cur]}\n`), "");
};
