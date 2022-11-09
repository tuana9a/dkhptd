export default class ObjectModifer {
  private input;
  private modifiers: ((input) => unknown)[];
  private opts;

  constructor(input) {
    this.input = input;
    this.modifiers = [];
  }

  modify(modifier: (input) => unknown) {
    this.modifiers.push(modifier);
    return this;
  }

  withOpts(opts = {}) {
    this.opts = opts;
    return this;
  }

  collect() {
    let output = this.input;
    for (const modifier of this.modifiers) {
      output = modifier(output);
    }
    return output;
  }
}
