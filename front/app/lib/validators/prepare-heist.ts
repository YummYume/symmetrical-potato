import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { zu } from '~/lib/utils/zod';

export const assetsPurchasedValidationSchema = z.object({
  assetsPurchased: zu.json,
});

export const chooseEmployeeValidationSchema = z.object({
  employee: z
    .string()
    .includes('employees', {
      message: 'prepare.employee.invalid_type',
    })
    .optional(),
});

export const assetsPurchasedResolver = zodResolver(assetsPurchasedValidationSchema);
export type AssetsPurchasedFormData = z.infer<typeof assetsPurchasedValidationSchema>;

export const chooseEmployeeResolver = zodResolver(chooseEmployeeValidationSchema);
export type ChooseEmployeeFormData = z.infer<typeof chooseEmployeeValidationSchema>;
