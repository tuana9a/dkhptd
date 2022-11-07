export default (classIds: string[]) => {
  if (!classIds) return false;
  if (!Array.isArray(classIds)) return false;
  if (classIds.length === 0) return false;
  for (const classId of classIds) {
    if (typeof classId !== "string") {
      return false;
    }
  }
  return true;
};
