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

export const resetPasswordValidationSchema = z
  .object({
    password: z
      .string({ required_error: 'register.password.required' })
      .min(8, { message: 'register.password.min_length' })
      .max(100, { message: 'register.password.max_length' })
      .regex(/[\d]/, { message: 'register.password.at_least_one_digit' })
      .regex(/[A-Z]/, { message: 'register.password.at_least_one_uppercase_letter' })
      .regex(/[a-z]/, { message: 'register.password.at_least_one_lowercase_letter' })
      .regex(/[!@#$%^&*()\-_=+;:,<.>]/, {
        message: 'register.password.at_least_one_special_character',
      }),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'register.password_confirm.must_match',
    path: ['passwordConfirm'],
  });

export const resetPasswordResolver = zodResolver(resetPasswordValidationSchema);

export type ResetPasswordFormData = z.infer<typeof resetPasswordValidationSchema>;
