import toSafeString from "./toSafeString";

export default (input) => toSafeString(input).trim().replace(/\s{2,}/g, " ");

