import { zodResolver } from '@hookform/resolvers/zod';

import { adminAssetValidationSchema } from './admin/asset';

import type { z } from 'zod';

export const assetResolver = zodResolver(adminAssetValidationSchema);

export type AssetFormData = z.infer<typeof adminAssetValidationSchema>;
