export default (propNames: string[] = [], options = { dropFalsy: false }) => (input: any) => {
  const output = {};

  for (const propName of propNames) {
    if (options.dropFalsy) {
      if (input[propName]) { // check not falsy value
        output[propName] = input[propName];
      }
    } else {
      output[propName] = input[propName];
    }
  }

  return output;
};
