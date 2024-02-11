import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { HeistDifficultyEnum, HeistPreferedTacticEnum } from '../api/types';

export const mapFiltersValidationSchema = z
  .object({
    startAtMin: z
      .string({
        invalid_type_error: 'string.not_a_string',
      })
      .optional(),
    startAtMax: z
      .string({
        invalid_type_error: 'string.not_a_string',
      })
      .optional(),
    shouldEndAtMin: z
      .string({
        invalid_type_error: 'string.not_a_string',
      })
      .optional(),
    shouldEndAtMax: z
      .string({
        invalid_type_error: 'string.not_a_string',
      })
      .optional(),
    minimumPayout: z
      .number({
        coerce: true,
        invalid_type_error: 'number.not_a_number',
      })
      .min(0, { message: 'heist.minimum_payout.positive' })
      .safe({ message: 'number.not_safe' })
      .optional(),
    maximumPayout: z
      .number({
        coerce: true,
        invalid_type_error: 'number.not_a_number',
      })
      .min(0, { message: 'heist.maximum_payout.positive' })
      .safe({ message: 'number.not_safe' })
      .optional(),
    preferedTactics: z
      .object({
        value: z.nativeEnum(HeistPreferedTacticEnum, {
          invalid_type_error: 'map.filters.prefered_tactics_invalid_type',
        }),
      })
      .array()
      .optional()
      .transform((value) => {
        if (!value || value.length === 0) {
          return undefined;
        }

        return value;
      }),
    difficulties: z
      .object({
        value: z.nativeEnum(HeistDifficultyEnum, {
          invalid_type_error: 'map.filters.difficulties_invalid_type',
        }),
      })
      .array()
      .optional()
      .transform((value) => {
        if (!value || value.length === 0) {
          return undefined;
        }

        return value;
      }),
    establishments: z
      .object({
        value: z.string({
          invalid_type_error: 'string.not_a_string',
        }),
      })
      .array()
      .optional()
      .transform((value) => {
        if (!value || value.length === 0) {
          return undefined;
        }

        return value;
      }),
  })
  .superRefine((data, ctx) => {
    if (data.startAtMin && data.startAtMax) {
      if (data.startAtMin > data.startAtMax) {
        ctx.addIssue({
          code: 'custom',
          path: ['startAtMin'],
          message: 'map.filters.start_at_min_greater_than_max',
        });
      }

      if (data.startAtMin === data.startAtMax) {
        ctx.addIssue({
          code: 'custom',
          path: ['startAtMin'],
          message: 'map.filters.start_at_min_equals_max',
        });
      }
    }
  });

export const mapFiltersResolver = zodResolver(mapFiltersValidationSchema);

export type MapFiltersFormData = z.infer<typeof mapFiltersValidationSchema>;
