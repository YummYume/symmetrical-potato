import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { ContractorRequestStatusEnum } from '~/lib/api/types';

export const adminContractorRequestValidationSchema = z.object({
  status: z.enum([ContractorRequestStatusEnum.Accepted, ContractorRequestStatusEnum.Rejected], {
    required_error: 'contractor_request.status.required',
    invalid_type_error: 'contractor_request.status.invalid_type',
  }),
  adminComment: z.optional(
    z.string().max(1000, { message: 'contractor_request.admin_comment.max' }),
  ),
});

export const adminContractorRequestResolver = zodResolver(adminContractorRequestValidationSchema);

export type AdminContractorRequestFormData = z.infer<typeof adminContractorRequestValidationSchema>;
