import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const mapFiltersValidationSchema = z.object({});

export const mapFiltersResolver = zodResolver(mapFiltersValidationSchema);

export type MapFiltersFormData = z.infer<typeof mapFiltersValidationSchema>;
