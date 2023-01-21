export default {
  infinity: (fn: () => unknown, delay: number) => {
    const call = async () => {
      await fn();
      setTimeout(call, delay);
    };
    call();
  },
};
