export default class ObjectModifer {
  private input: any;
  private modifiers: ((input: any) => any)[]; // TODO
  private opts: any;

  constructor(input: any) {
    this.input = input;
    this.modifiers = [];
  }

  modify(modifier: (input: any) => any) {
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
