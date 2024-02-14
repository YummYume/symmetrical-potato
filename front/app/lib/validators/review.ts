import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const reviewValidationSchema = z.object({
  rating: z
    .number({
      coerce: true,
      invalid_type_error: 'number.not_a_number',
    })
    .min(0.5, { message: 'rating.minimum' })
    .max(5, { message: 'rating.maximum' })
    .safe({ message: 'number.not_safe' }),
  comment: z.string().trim().max(1000, 'review.comment.max_length').optional(),
});

export const reviewResolver = zodResolver(reviewValidationSchema);
export type ReviewFormData = z.infer<typeof reviewValidationSchema>;
