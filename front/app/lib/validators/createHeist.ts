import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { HeistDifficultyEnum, HeistPreferedTacticEnum } from '../api/types';
import dayjs from '../utils/dayjs';
import { zu } from '../utils/zod';

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
    startAt: zu.date(
      z.coerce.date({
        required_error: 'heist.start_at.required',
        invalid_type_error: 'heist.start_at.invalid_type',
      }),
    ),
    shouldEndAt: zu.date(
      z.coerce.date({
        required_error: 'heist.should_end_at.required',
        invalid_type_error: 'heist.should_end_at.invalid_type',
      }),
    ),
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
    establishment: z
      .string({
        required_error: 'heist.establishment.required',
      })
      .min(1, {
        message: 'heist.establishment.required',
      })
      .includes('establishment', {
        message: 'heist.establishment.invalid_type',
      }),
    preferedTactic: z.nativeEnum(HeistPreferedTacticEnum, {
      required_error: 'heist.prefered_tactic.required',
      invalid_type_error: 'heist.prefered_tactic.invalid_type',
    }),
    difficulty: z.nativeEnum(HeistDifficultyEnum, {
      required_error: 'heist.difficulty.required',
      invalid_type_error: 'heist.difficulty.invalid_type',
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
  .refine((data) => dayjs().isSameOrBefore(dayjs(data.startAt), 'minute'), {
    message: 'heist.start_at.is_past_date',
    path: ['startAt'],
  })
  .refine((data) => dayjs(data.startAt).isBefore(dayjs(data.shouldEndAt), 'minute'), {
    message: 'heist.should_end_at.is_before_start_at',
    path: ['shouldEndAt'],
  })
  .refine((data) => data.minimumPayout < data.maximumPayout, {
    message: 'heist.maximum_payout_is_lower_than_minimum_payout',
    path: ['maximumPayout'],
  });

export const createHeistResolver = zodResolver(createHeistValidationSchema);
export type CreateHeistFormData = z.infer<typeof createHeistValidationSchema>;
