import type { Option } from '~lib/types/select';

/**
 * Format enums to options for select
 *
 * @param enums An array of enums
 * @param translationPrefix A prefix to add to each label
 * @example
 * ```ts
 * const enum MyEnum {
 *   Foo = 'Foo',
 *   Bar = 'Bar',
 * }
 *
 * const options = formatEnums(Object.values(MyEnum), 'my_enum');
 * // options = [
 * //   { value: 'Foo', label: 'my_enum.foo' },
 * //   { value: 'Bar', label: 'my_enum.bar' },
 * // ]
 * ```
 */
export const formatEnums: <T extends string[]>(
  enums: T,
  translationPrefix?: string | null,
) => Option[] = (enums, translationPrefix = null) => {
  return enums.map((value) => ({
    value,
    label: translationPrefix ? `${translationPrefix}.${value.toLowerCase()}` : value,
  }));
};
