/**
 * Returns a shallow copy of `obj` with keys whose value is `undefined` removed.
 * Useful before object-spread merging so explicit `undefined` values don't
 * overwrite defaults from a lower-priority source.
 */
export const omitUndefined = <T extends object>(
  obj: T | undefined,
): Partial<T> => {
  if (!obj) return {};
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
};
