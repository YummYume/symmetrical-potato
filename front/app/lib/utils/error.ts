export type FormErrorField = { message: string | undefined } | undefined;

/**
 * Returns the error message if the error is defined, otherwise null.
 */
export const getFormErrorField = (error: FormErrorField) =>
  error?.message !== undefined ? error.message : null;
