import RequireLengthFailed from "../exceptions/RequireLengthFailed";

export default (name: string, input, comparator: (input) => boolean) => {
  if (!comparator(input.length)) throw new RequireLengthFailed(name, input, comparator);
};
