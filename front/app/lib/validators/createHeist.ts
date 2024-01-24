import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { HeistDifficultyEnum, HeistPreferedTacticEnum } from '~/lib//api/types';
import dayjs from '~/lib/utils/dayjs';
import { zu } from '~/lib/utils/zod';

export const createHeistValidationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'heist.name.min_length' })
      .max(100, { message: 'heist.name.max_length' }),
    description: z
      .string()
      .trim()
      .min(10, {
        message: 'heist.description.min_length',
      })
      .max(255, {
        message: 'heist.description.max_length',
      }),
    startAtDate: z.string({
      required_error: 'heist.start_at.date.required',
      invalid_type_error: 'heist.start_at.date.invalid_type',
    }),
    startAtTime: z.string({
      required_error: 'heist.start_at.time.required',
      invalid_type_error: 'heist.start_at.time.invalid_type',
    }),
    shouldEndAtDate: z.string({
      required_error: 'heist.should_end_at.date.required',
      invalid_type_error: 'heist.should_end_at.date.invalid_type',
    }),
    shouldEndAtTime: z.string({
      required_error: 'heist.should_end_at.time.required',
      invalid_type_error: 'heist.should_end_at.time.invalid_type',
    }),
    minimumPayout: zu.number(
      z.coerce
        .number({
          required_error: 'heist.minimum_payout.required',
          invalid_type_error: 'heist.minimum_payout.invalid_type',
        })
        .positive({
          message: 'heist.minimum_payout.positive',
        }),
    ),
    maximumPayout: zu.number(
      z.coerce
        .number({
          required_error: 'heist.maximum_payout.required',
          invalid_type_error: 'heist.maximum_payout.invalid_type',
        })
        .positive({
          message: 'heist.maximum_payout.positive',
        }),
    ),
    minimumRequiredRating: zu.number(
      z.coerce
        .number({
          invalid_type_error: 'heist.minimum_required_rating.invalid_type',
        })
        .positive({
          message: 'heist.minimum_required_rating.positive',
        })
        .max(5, {
          message: 'heist.minimum_required_rating.max',
        })
        .optional(),
    ),
    allowedEmployees: z
      .object({
        value: z.string({
          required_error: 'heist.allowed_employees.value.required',
          invalid_type_error: 'heist.allowed_employees.value.invalid_type',
        }),
      })
      .array()
      .min(1, { message: 'heist.allowed_employees.min_length' })
      .max(10, { message: 'heist.allowed_employees.max_length' }),
    forbiddenAssets: z
      .object({
        value: z.string({
          invalid_type_error: 'heist.forbidden_assets.value.invalid_type',
        }),
      })
      .array()
      .optional(),
    forbiddenUsers: z
      .object({
        value: z.string({
          invalid_type_error: 'heist.forbidden_users.value.invalid_type',
        }),
      })
      .array()
      .optional(),
    establishment: z.object({
      value: z
        .string({
          required_error: 'heist.establishment.required',
        })
        .min(1, {
          message: 'heist.establishment.required',
        })
        .includes('establishment', {
          message: 'heist.establishment.invalid_type',
        }),
    }),
    preferedTactic: z.object({
      value: z.nativeEnum(HeistPreferedTacticEnum, {
        required_error: 'heist.prefered_tactic.required',
        invalid_type_error: 'heist.prefered_tactic.invalid_type',
      }),
    }),
    difficulty: z.object({
      value: z.nativeEnum(HeistDifficultyEnum, {
        required_error: 'heist.difficulty.required',
        invalid_type_error: 'heist.difficulty.invalid_type',
      }),
    }),
    objectives: z
      .object({
        name: z
          .string()
          .min(2, { message: 'heist.objectives.name.min_length' })
          .max(100, { message: 'heist.objectives.name.max_length' }),
        description: z
          .string()
          .min(10, { message: 'heist.objectives.description.min_length' })
          .max(255, { message: 'heist.objectives.description.max_length' }),
      })
      .array()
      .optional(),
  })
  .refine((data) => dayjs(`${data.startAtDate} ${data.startAtTime}`).isValid(), {
    message: 'heist.start_at.invalid_date',
    path: ['startAtDate'],
  })
  .refine((data) => dayjs(`${data.shouldEndAtDate} ${data.shouldEndAtTime}`).isValid(), {
    message: 'heist.should_end_at.invalid_date',
    path: ['shouldEndAtDate'],
  }) // Check if startAt is after current date
  .refine(
    (data) => dayjs().isSameOrBefore(dayjs(`${data.startAtDate} ${data.startAtTime}`), 'minute'),
    {
      message: 'heist.start_at.is_past_date',
      path: ['startAtDate'],
    },
  ) // Check if startAt is before shouldEndAt
  .refine(
    (data) =>
      dayjs(`${data.startAtDate} ${data.startAtTime}`).isBefore(
        dayjs(`${data.shouldEndAtDate} ${data.shouldEndAtTime}`),
        'minute',
      ),
    {
      message: 'heist.should_end_at.is_before_start_at',
      path: ['shouldEndAtDate'],
    },
  )
  .refine((data) => data.minimumPayout < data.maximumPayout, {
    message: 'heist.maximum_payout_is_lower_than_minimum_payout',
    path: ['maximumPayout'],
  });

export const createHeistResolver = zodResolver(createHeistValidationSchema);
export type CreateHeistFormData = z.infer<typeof createHeistValidationSchema>;
