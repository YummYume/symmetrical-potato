import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// import { UserLocaleEnum } from '~/lib/api/types';
import { zu } from '~utils/zod';

export const adminUserValidationSchema = z.object({
  email: z
    .string({
      required_error: 'user.email.required',
    })
    .email({ message: 'user.email.invalid' }),
  balance: zu.number(
    z
      .number()
      .min(Number.MIN_SAFE_INTEGER, { message: 'user.balance.min' })
      .max(Number.MAX_SAFE_INTEGER, { message: 'user.balance.max' }),
    {
      required_error: 'user.balance.required',
    },
  ),
  description: z.optional(z.string().max(1000, { message: 'user.description.max' })),
  // locale: z.nativeEnum(UserLocaleEnum, {
  //   required_error: 'user.locale.required',
  //   invalid_type_error: 'user.locale.invalid',
  // }),
});

export const adminUserResolver = zodResolver(adminUserValidationSchema);

export type AdminUserFormData = z.infer<typeof adminUserValidationSchema>;
