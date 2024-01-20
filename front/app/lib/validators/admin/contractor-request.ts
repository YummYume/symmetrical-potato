import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { ContractorRequestStatusEnum } from '~/lib/api/types';
import { zu } from '~/lib/utils/zod';

export const adminContractorRequestValidationSchema = z.object({
  status: z.enum([ContractorRequestStatusEnum.Accepted, ContractorRequestStatusEnum.Rejected], {
    required_error: 'contractor_request.status.required',
    invalid_type_error: 'contractor_request.status.invalid_type',
  }),
  adminComment: zu.string(
    z
      .string({ coerce: true, invalid_type_error: 'sring.not_a_string' })
      .max(1000, { message: 'contractor_request.admin_comment.max' })
      .optional(),
  ),
});

export const adminContractorRequestResolver = zodResolver(adminContractorRequestValidationSchema);

export type AdminContractorRequestFormData = z.infer<typeof adminContractorRequestValidationSchema>;
