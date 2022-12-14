import toNormalizedString from "../utils/toNormalizedString";

export default (input: string) => input.split(",").map((x) => toNormalizedString(x)).filter((x) => x);
