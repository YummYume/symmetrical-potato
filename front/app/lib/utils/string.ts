export type TruncateOptions = {
  /**
   * The suffix to append to the truncated string
   */
  suffix?: string;
};

/**
 * Truncate a string to a given length
 *
 * @param value The string to truncate
 * @param length The length to truncate to
 * @param options Options to customize the behavior
 */
export const truncate = (value: string, length: number, options?: TruncateOptions) => {
  if (value.length <= length) {
    return value;
  }

  const optionsWithDefaults = {
    suffix: '...',
    ...options,
  };

  return `${value.slice(0, length - 3)}${optionsWithDefaults.suffix}`;
};
