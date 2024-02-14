import { zodResolver } from '@hookform/resolvers/zod';

import { adminEstablishmentValidationSchema } from './admin/establishment';

import type { z } from 'zod';

export const establishmentResolver = zodResolver(adminEstablishmentValidationSchema);

export type EstablishmentFormData = z.infer<typeof adminEstablishmentValidationSchema>;
