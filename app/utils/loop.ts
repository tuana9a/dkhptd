export default {
  infinity: (fn: Function, delay: number) => {
    const callIt = async () => {
      await fn();
      setTimeout(callIt, delay);
    };
    callIt();
  },
};
