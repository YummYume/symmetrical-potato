import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import dayjs from '~utils/dayjs';

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
      if (dayjs(data.startAtMin).isAfter(data.startAtMax)) {
        ctx.addIssue({
          code: 'custom',
          path: ['startAtMin'],
          message: 'map.filters.start_at_min_greater_than_max',
        });
      }
    }

    if (data.shouldEndAtMin && data.shouldEndAtMax) {
      if (dayjs(data.startAtMax).isBefore(data.startAtMin)) {
        ctx.addIssue({
          code: 'custom',
          path: ['startAtMin'],
          message: 'map.filters.start_at_min_equals_max',
        });
      }
    }

    if (data.startAtMin && dayjs(data.startAtMin).isBefore(dayjs().startOf('day'))) {
      ctx.addIssue({
        code: 'custom',
        path: ['startAtMin'],
        message: 'map.filters.date_greater_than_or_equal_now',
      });
    }

    if (data.startAtMax && dayjs(data.startAtMax).isBefore(dayjs().startOf('day'))) {
      ctx.addIssue({
        code: 'custom',
        path: ['startAtMax'],
        message: 'map.filters.date_greater_than_or_equal_now',
      });
    }

    if (data.startAtMin && dayjs(data.startAtMin).isBefore(dayjs().startOf('day'))) {
      ctx.addIssue({
        code: 'custom',
        path: ['startAtMin'],
        message: 'map.filters.date_greater_than_or_equal_now',
      });
    }

    if (data.startAtMax && dayjs(data.startAtMax).isBefore(dayjs().startOf('day'))) {
      ctx.addIssue({
        code: 'custom',
        path: ['startAtMax'],
        message: 'map.filters.date_greater_than_or_equal_now',
      });
    }

    if (data.minimumPayout && data.maximumPayout) {
      if (data.minimumPayout > data.maximumPayout) {
        ctx.addIssue({
          code: 'custom',
          path: ['minimumPayout'],
          message: 'map.filters.minimum_payout_greater_than_maximum_payout',
        });
      }
    }
  });

export const mapFiltersResolver = zodResolver(mapFiltersValidationSchema);

export type MapFiltersFormData = z.infer<typeof mapFiltersValidationSchema>;
