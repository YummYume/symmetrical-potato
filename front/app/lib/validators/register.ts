import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const registerValidationSchema = z
  .object({
    email: z
      .string({
        required_error: 'register.email.required',
      })
      .email({ message: 'register.email.invalid' }),
    username: z
      .string({
        required_error: 'register.username.required',
      })
      .min(2, {
        message: 'register.username.min_length',
      })
      .max(100, {
        message: 'register.username.max_length',
      }),
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
    reason: z
      .string({
        required_error: 'register.reason.required',
      })
      .min(10, {
        message: 'register.reason.min_length',
      })
      .max(2000, {
        message: 'register.reason.max_length',
      }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'register.password_confirm.must_match',
    path: ['passwordConfirm'],
  });

export const registerResolver = zodResolver(registerValidationSchema);

export type RegisterFormData = z.infer<typeof registerValidationSchema>;
