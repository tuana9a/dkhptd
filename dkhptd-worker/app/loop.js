module.exports = {
  infinity(fn, delay) {
    const callIt = async () => {
      await fn();
      setTimeout(callIt, delay);
    };
    callIt();
  },
};
