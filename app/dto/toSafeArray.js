module.exports = (input) => {
  try {
    return Array.from(input);
  } catch (err) {
    return [];
  }
};
