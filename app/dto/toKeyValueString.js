module.exports = (input) => Object.keys(input).reduce((agg, cur) => (`${agg + cur} = ${input[cur]}\n`), "").trim();
