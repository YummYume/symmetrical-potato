import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { ReviewRatingEnum } from '~/lib/api/types';

export const reviewValidationSchema = z.object({
  rating: z.nativeEnum(ReviewRatingEnum, {
    required_error: 'review.rating.required',
    invalid_type_error: 'review.rating.invalid_type',
  }),
  comment: z.string().trim().min(1, 'review.min_length').max(1000, 'review.max_length').optional(),
});

export const reviewResolver = zodResolver(reviewValidationSchema);
export type ReviewFormData = z.infer<typeof reviewValidationSchema>;
