import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const forgottenPasswordValidationSchema = z.object({
  username: z.string({ required_error: 'forgotten_password.username.required' }),
});

export const forgottenPasswordResolver = zodResolver(forgottenPasswordValidationSchema);
export type ForgottenPasswordFormData = z.infer<typeof forgottenPasswordValidationSchema>;
