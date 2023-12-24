import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const loginValidationSchema = zfd.formData({
  username: zfd.text(z.string({ required_error: 'login.username.required' })),
  password: zfd.text(z.string({ required_error: 'login.password.required' })),
});

export const loginResolver = zodResolver(loginValidationSchema);
export type LoginFormData = z.infer<typeof loginValidationSchema>;
