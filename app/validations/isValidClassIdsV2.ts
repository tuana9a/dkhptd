import isValidClassIds from "./isValidClassIds";

export default (classIds: string[][]) => {
  if (!classIds) return false;
  if (!Array.isArray(classIds)) return false;
  if (classIds.length === 0) return false;
  for (const orderedClassIds of classIds) {
    if (!isValidClassIds(orderedClassIds)) {
      return false;
    }
  }
  return true;
};
