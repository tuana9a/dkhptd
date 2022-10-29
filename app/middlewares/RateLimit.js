const ratelimit = require("express-rate-limit");

module.exports = ({ windowMs, max }) => ratelimit({
  windowMs: windowMs,
  max: max,
});
