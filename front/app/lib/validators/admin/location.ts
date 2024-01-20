import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { zu } from '~/lib/utils/zod';

export const adminLocationValidationSchema = z.object({
  latitude: zu.number(
    z
      .number({
        coerce: true,
        invalid_type_error: 'number.not_a_number',
        required_error: 'number.required',
      })
      .min(-90, { message: 'location.latitude.min' })
      .max(90, { message: 'location.latitude.max' })
      .safe({ message: 'number.not_safe' }),
  ),
  longitude: zu.number(
    z
      .number({
        coerce: true,
        invalid_type_error: 'number.not_a_number',
        required_error: 'number.required',
      })
      .min(-180, { message: 'location.longitude.min' })
      .max(180, { message: 'location.longitude.max' })
      .safe({ message: 'number.not_safe' }),
  ),
  name: z
    .string({ required_error: 'location.name.required', invalid_type_error: 'sring.not_a_string' })
    .min(1, { message: 'location.name.min' })
    .max(255, { message: 'location.name.max' }),
  address: zu.string(
    z
      .string({ coerce: true, invalid_type_error: 'sring.not_a_string' })
      .max(255, { message: 'location.address.max' })
      .optional(),
  ),
});

export const adminLocationResolver = zodResolver(adminLocationValidationSchema);

export type AdminLocationFormData = z.infer<typeof adminLocationValidationSchema>;
