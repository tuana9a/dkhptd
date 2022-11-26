import FaslyValueError from "../exceptions/FalsyValueError";
import isFalsy from "../validations/isFalsy";

export default (name: string, input) => {
  if (isFalsy(input)) throw new FaslyValueError(name, input);
};
