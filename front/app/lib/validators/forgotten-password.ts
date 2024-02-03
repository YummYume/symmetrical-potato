import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const forgottenPasswordValidationSchema = z.object({
  username: z.string({ required_error: 'forgotten_password.username.required' }),
  email: z
    .string({
      required_error: 'forgotten_password.email.required',
    })
    .email({ message: 'forgotten_password.email.invalid' }),
});

export const forgottenPasswordResolver = zodResolver(forgottenPasswordValidationSchema);

export type ForgottenPasswordFormData = z.infer<typeof forgottenPasswordValidationSchema>;
