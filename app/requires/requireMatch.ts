import RequireMatchFailed from "../exceptions/RequireMatchFailed";

export default (regex: RegExp) => (name: string, input: string) => {
  if (!input.match(regex)) throw new RequireMatchFailed(name, input, regex);
};
