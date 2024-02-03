import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { zu } from '~/lib/utils/zod';

export const contractorRequestValidationSchema = z.object({
  reason: zu.string(
    z
      .string({ coerce: true, invalid_type_error: 'sring.not_a_string' })
      .min(10, { message: 'contractor_request.reason.min' })
      .max(1000, { message: 'contractor_request.admin_comment.max' }),
  ),
});

export const contractorRequestResolver = zodResolver(contractorRequestValidationSchema);

export type ContractorRequestFormData = z.infer<typeof contractorRequestValidationSchema>;
