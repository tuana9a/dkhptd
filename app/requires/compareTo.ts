import CompareFailedError from "../exceptions/CompareFailedError";

export default (name: string, input, comparator: (i) => boolean) => {
  if (!comparator(input)) throw new CompareFailedError(name, input, comparator);
};
