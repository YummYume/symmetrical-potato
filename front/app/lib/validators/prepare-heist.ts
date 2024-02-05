import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { zu } from '~/lib/utils/zod';

export const prepareHeistValidationSchema = z.object({
  assetsPurchased: zu.json,
  employee: z
    .string()
    .includes('employees', {
      message: 'prepare.employee.invalid_type',
    })
    .optional(),
});

export const prepareHeistResolver = zodResolver(prepareHeistValidationSchema);
export type PrepareHeistFormData = z.infer<typeof prepareHeistValidationSchema>;
