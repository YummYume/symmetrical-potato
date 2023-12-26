import { z } from 'zod';

import type { RawCreateParams as ParamsZod } from 'zod';

/**
 * Check if a value is a number or a string that can be parsed to a number
 */
export const number = (zodNumber: z.ZodNumber, params: ParamsZod = {}) =>
  z.union([z.number(), z.string()]).pipe(z.coerce.number(params).pipe(zodNumber));

/**
 * Check if a value is a date or a string that can be parsed to a date
 */
export const date = (zodDate: z.ZodDate, params: ParamsZod) =>
  z.union([z.date(), z.string()]).pipe(z.coerce.date(params).pipe(zodDate));

/**
 * Check if a value is a boolean or a string that can be parsed to a boolean
 */
export const boolean = (zodBoolean: z.ZodBoolean, params: ParamsZod) =>
  z.union([z.boolean(), z.string()]).pipe(z.coerce.boolean(params).pipe(zodBoolean));

/**
 * Check if a value is a string or a number
 */
export const string = (zodString: z.ZodString, params: ParamsZod) =>
  z.union([z.string(), z.number()]).pipe(z.coerce.string(params).pipe(zodString));

export const zu = {
  number,
  date,
  boolean,
  string,
};
