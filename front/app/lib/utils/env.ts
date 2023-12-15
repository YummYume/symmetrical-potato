const envs: Record<string, string> = {};

/**
 * Get an environment variable.
 */
export const getEnv = (key: string): string => {
  if (typeof document !== 'undefined') {
    return envs[key] || '';
  }

  return process.env[key] ?? '';
};

/**
 * Set an environment variable.
 */
export const setEnv = (key: string, value: string | undefined | null): void => {
  envs[key] = value ?? '';
};
