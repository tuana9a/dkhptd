import toNormalizedString from "../utils/toNormalizedString";

export default (input) => toNormalizedString(input).split(",").map((x) => toNormalizedString(x)).filter((x) => x);
