module.exports = (propNames = []) => (input) => {
  const output = {};

  const remainKeys = Object.keys(input).filter((key) => !propNames.includes(key));

  for (const propName of remainKeys) {
    output[propName] = input[propName];
  }

  return output;
};
