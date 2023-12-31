/**
 * Extracts the index from a path. (e.g. name[index].firstName)
 */
export const extractIndex = (path: string) => {
  const match = path.match(/\[(\d+)\]/);
  if (!match) return null;
  return parseInt(match[1], 10);
};
