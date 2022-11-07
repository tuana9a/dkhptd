import toNormalizedString from "../dto/toNormalizedString";

export default (input: any) => toNormalizedString(input).split(",").map((x) => toNormalizedString(x)).filter((x) => x);
