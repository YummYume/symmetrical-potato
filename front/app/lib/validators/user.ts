import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { UserLocaleEnum } from '~/lib/api/types';
import { zu } from '~utils/zod';

export const userValidationSchema = z
  .object({
    email: z
      .string({
        required_error: 'user.email.required',
        invalid_type_error: 'sring.not_a_string',
      })
      .email({ message: 'user.email.invalid' }),
    password: zu.string(
      z
        .string({ coerce: true, invalid_type_error: 'sring.not_a_string' })
        .min(8, { message: 'user.password.min_length' })
        .max(100, { message: 'user.password.max_length' })
        .regex(/[\d]/, { message: 'user.password.at_least_one_digit' })
        .regex(/[A-Z]/, { message: 'user.password.at_least_one_uppercase_letter' })
        .regex(/[a-z]/, { message: 'user.password.at_least_one_lowercase_letter' })
        .regex(/[!@#$%^&*()\-_=+;:,<.>]/, {
          message: 'user.password.at_least_one_special_character',
        })
        .optional()
        .or(z.literal('')),
    ),
    passwordConfirm: zu.string(
      z.string({ coerce: true, invalid_type_error: 'sring.not_a_string' }).optional(),
    ),
    description: z
      .string({ coerce: true })
      .max(1000, { message: 'user.description.max' })
      .optional(),
    locale: z.nativeEnum(UserLocaleEnum, {
      required_error: 'user.locale.required',
      invalid_type_error: 'user.locale.invalid',
    }),
  })
  .refine(
    (data) => {
      if (data.password || data.passwordConfirm) {
        return data.password === data.passwordConfirm;
      }

      return true;
    },
    {
      message: 'user.password_confirm.must_match',
      path: ['passwordConfirm'],
    },
  );

export const userResolver = zodResolver(userValidationSchema);

export type UserFormData = z.infer<typeof userValidationSchema>;
