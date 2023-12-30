import { z } from 'zod';

/**
 * Check if a value is a number or a string that can be parsed to a number
 */
export const number = (zodNumber: z.ZodNumber) => z.union([z.number(), z.string()]).pipe(zodNumber);

/**
 * Check if a value is a date or a string that can be parsed to a date
 */
export const date = (zodDate: z.ZodDate) =>
  z.union([z.date(), z.string(), z.number()]).pipe(zodDate);

/**
 * Check if a value is a boolean or a string that can be parsed to a boolean
 */
export const boolean = (zodBoolean: z.ZodBoolean) =>
  z.union([z.boolean(), z.string()]).pipe(zodBoolean);

/**
 * Check if a value is a string or a number
 */
export const string = (zodString: z.ZodString) => z.union([z.string(), z.number()]).pipe(zodString);

export const zu = {
  number,
  date,
  boolean,
  string,
};
