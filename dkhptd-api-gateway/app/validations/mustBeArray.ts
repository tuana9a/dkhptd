import NotAnArrayError from "../exceptions/NotAnArrayError";

export default (name: string, input, requireEach?: ((name: string, input) => void)[]) => {
  if (!Array.isArray(input)) throw new NotAnArrayError(name, input);
  if (requireEach) {
    for (let i = 0; i < input.length; i++) {
      for (const r of requireEach) {
        r(`${name}[${i}]`, input[i]);
      }
    }
  }
};
