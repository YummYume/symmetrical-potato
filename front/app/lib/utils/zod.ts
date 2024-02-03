import { z } from 'zod';

/**
 * refer to https://zod.dev/?id=json-type
 */
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];

/**
 * Check if a value is a JSON
 */
export const json: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(json), z.record(json)]),
);

/**
 * Check if a value is a number or a string that can be parsed to a number
 */
export const number = <ZodType extends z.ZodTypeAny>(zodNumber: ZodType) =>
  z.union([z.number(), z.string()]).pipe<ZodType>(zodNumber);

/**
 * Check if a value is a date or a string that can be parsed to a date
 */
export const date = <ZodType extends z.ZodTypeAny>(zodDate: ZodType) =>
  z.union([z.date(), z.string(), z.number()]).pipe<ZodType>(zodDate);

/**
 * Check if a value is a boolean or a string that can be parsed to a boolean
 */
export const boolean = <ZodType extends z.ZodTypeAny>(zodBoolean: ZodType) =>
  z.union([z.boolean(), z.string()]).pipe<ZodType>(zodBoolean);

/**
 * Check if a value is a string or a number that can be parsed to a string
 */
export const string = <ZodType extends z.ZodTypeAny>(zodString: ZodType) =>
  z.union([z.string(), z.number()]).pipe<ZodType>(zodString);

export const zu = {
  number,
  date,
  boolean,
  string,
  json,
};
