import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { HeistDifficultyEnum, HeistPreferedTacticEnum } from '../api/types';
import dayjs from '../utils/dayjs';
import { zu } from '../utils/zod';

export const createHeistValidationSchema = z
  .object({
    name: z.string({
      required_error: 'heist.name.required',
    }),
    description: z
      .string({
        required_error: 'heist.description.required',
      })
      .min(10, {
        message: 'heist.description.min_length',
      })
      .max(255, {
        message: 'heist.description.max_length',
      }),
    startAt: zu.date(z.date(), {
      required_error: 'heist.start_at.required',
      invalid_type_error: 'heist.start_at.invalid_type',
    }),
    shouldEndAt: zu.date(z.date(), {
      required_error: 'heist.should_end_at.required',
      invalid_type_error: 'heist.should_end_at.invalid_type',
    }),
    minimumPayout: zu.number(z.number(), {
      required_error: 'heist.minimum_payout.required',
      invalid_type_error: 'heist.minimum_payout.invalid_type',
    }),
    maximumPayout: zu.number(z.number(), {
      required_error: 'heist.maximum_payout.required',
      invalid_type_error: 'heist.maximum_payout.invalid_type',
    }),
    establishement: z.string({
      required_error: 'heist.establishement.required',
    }),
    preferedTactic: z.nativeEnum(HeistPreferedTacticEnum, {
      required_error: 'heist.prefered_tactic.required',
      invalid_type_error: 'heist.prefered_tactic.invalid_type',
    }),
    difficulty: z.nativeEnum(HeistDifficultyEnum, {
      required_error: 'heist.difficulty.required',
      invalid_type_error: 'heist.difficulty.invalid_type',
    }),
    objectives: z.string().array().optional(),
  })
  .refine((data) => dayjs().isSameOrBefore(dayjs(data.startAt), 'minute'), {
    message: 'heist.start_at.is_past_date',
    path: ['startAt'],
  })
  .refine((data) => dayjs(data.startAt).isBefore(dayjs(data.shouldEndAt), 'minute'), {
    message: 'heist.should_end_at.is_before_start_at',
    path: ['shouldEndAt'],
  })
  .refine((data) => data.minimumPayout <= data.maximumPayout, {
    message: 'heist.maximum_payout.is_before_minimum_payout',
    path: ['maximumPayout'],
  });

export const createHeistResolver = zodResolver(createHeistValidationSchema);
export type CreateHeistFormData = z.infer<typeof createHeistValidationSchema>;
