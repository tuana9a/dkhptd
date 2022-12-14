import TypeMismatchError from "../exceptions/TypeMismatchError";

export default (type: string) => (name: string, input) => {
  if (typeof input != type) throw new TypeMismatchError(name, input, type);
};
