import type { ZodIssue } from 'zod';

export type FieldError = {
  field: string;
  message: string;
};

/**
 * Transforms Zod issues to field errors.
 */
export const parseZodErrorsToFieldErrors = (issues: ZodIssue[]) => {
  const fieldErrors: FieldError[] = [];

  for (const issue of issues) {
    const field = issue.path.join('.');
    const message = issue.message;

    fieldErrors.push({ field, message });
  }

  return fieldErrors;
};

/**
 * Returns the error message for a given path.
 */
export const getMessageErrorForPath = (fieldErrors: FieldError[], path: string) => {
  for (const fieldError of fieldErrors) {
    if (fieldError.field === path) {
      return fieldError.message;
    }
  }

  return undefined;
};
