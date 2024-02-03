import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { zu } from '~/lib/utils/zod';

export const prepareHeistValidationSchema = z.object({
  assetsPurchased: zu.json,
  employee: z
    .string({
      required_error: 'prepare.establishment.required',
    })
    .min(1, {
      message: 'prepare.employee.required',
    })
    .includes('employees', {
      message: 'prepare.employee.invalid_type',
    }),
});

export const prepareHeistResolver = zodResolver(prepareHeistValidationSchema);
export type PrepareHeistFormData = z.infer<typeof prepareHeistValidationSchema>;
