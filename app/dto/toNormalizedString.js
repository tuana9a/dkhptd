const toSafeString = require("./toSafeString");

module.exports = (input) => toSafeString(input).trim().replace(/\s{2,}/g, " "); // no 2 space
