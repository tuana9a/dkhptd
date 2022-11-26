import EmptyStringError from "../exceptions/EmptyStringError";

export default (name: string, input: string) => {
  if (input.match(/^\s*$/)) throw new EmptyStringError(name, input);
};
