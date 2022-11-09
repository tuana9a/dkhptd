import NotAndArrayError from "../exceptions/NotAnArrayError";

export default (size: number) => (input) => {
  if (!Array.isArray(input)) throw new NotAndArrayError(input);
  if (input.length > size) return true;
  return false;
};
