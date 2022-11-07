import toSafeString from "./toSafeString";

export default (input: any) => toSafeString(input).trim().replace(/\s{2,}/g, " ");

