export default <T>(input: any): T[] => {
  try {
    return Array.from(input);
  } catch (err) {
    return [];
  }
};
