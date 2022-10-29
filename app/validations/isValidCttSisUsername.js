module.exports = (username) => (username && username.match(/^\s+$/) && username.length >= 8);
