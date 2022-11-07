export default class ObjectModifer {
  modifiers: ((input: any) => any)[]; // TODO
  opts: any;

  constructor(modifiers = []) {
    this.modifiers = modifiers;
  }

  withOpts(opts = {}) {
    this.opts = opts;
    return this;
  }

  apply(input: any) {
    let output = input;
    for (const modifier of this.modifiers) {
      output = modifier(output);
    }
    return output;
  }
}
