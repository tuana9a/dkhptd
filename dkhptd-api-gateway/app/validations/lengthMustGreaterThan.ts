import RequireLengthFailed from "../exceptions/RequireLengthFailed";

export default (name: string, input: { length: number }, value: number) => {
  if (input.length <= value) throw new RequireLengthFailed(name, input, x => x > value);
};
