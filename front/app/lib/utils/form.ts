export type WithoutNullableKeys<Type extends Record<string | number | symbol, unknown>> = {
  [Key in keyof Type]-?: WithoutNullableKeys<NonNullable<Type[Key]>>;
};

/**
 * Removes nullable values (null and undefined) from an object.
 */
export const withoutNullableValues = <Type extends Record<string | number | symbol, unknown>>(
  obj: Type,
): WithoutNullableKeys<Type> => {
  const result = {} as WithoutNullableKeys<Type>;

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      result[key as keyof Type] = value as any;
    }
  });

  return result;
};

/**
 * Converts a value to a string.
 */
export const toString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
};
