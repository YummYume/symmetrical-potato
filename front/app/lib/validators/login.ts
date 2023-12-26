import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const loginValidationSchema = z.object({
  username: z.string({ required_error: 'login.username.required' }),
  password: z.string({ required_error: 'login.password.required' }),
});

export const loginResolver = zodResolver(loginValidationSchema);
export type LoginFormData = z.infer<typeof loginValidationSchema>;
