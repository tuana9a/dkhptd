class ObjectModifer {
  /**
   *
   * @param {Function[]} modifiers
   */
  constructor(modifiers = []) {
    this.modifiers = modifiers;
  }

  withOpts(opts = {}) {
    this.opts = opts;
    return this;
  }

  withModifierChain() {
    return this;
  }

  apply(input) {
    let output = input;
    for (const modifier of this.modifiers) {
      output = modifier(output);
    }
    return output;
  }
}

module.exports = ObjectModifer;
