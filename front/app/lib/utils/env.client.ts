const envs: Record<string, string> = {};

/**
 * Get an environment variable.
 */
export const getEnv = (key: string): string => {
  return envs[key] || '';
};

/**
 * Set an environment variable.
 */
export const setEnv = (key: string, value: string | undefined | null): void => {
  envs[key] = value || '';
};
