export default {
  infinity(fn: () => unknown, delay: number) {
    const run = async () => {
      await fn();
      setTimeout(run, delay);
    };
    run();
  },
};
