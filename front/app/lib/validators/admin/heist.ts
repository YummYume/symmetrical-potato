import { zodResolver } from '@hookform/resolvers/zod';

import { updateHeistValidationSchema } from '../update-heist';

import type { z } from 'zod';

export const adminHeistResolver = zodResolver(updateHeistValidationSchema);

export type AdminHeistFormData = z.infer<typeof updateHeistValidationSchema>;
