import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// import { AssetTypeEnum } from '~/lib/api/types';
import { zu } from '~utils/zod';

export const adminAssetValidationSchema = z.object({
  name: z
    .string({
      required_error: 'asset.name.required',
      invalid_type_error: 'sring.not_a_string',
    })
    .min(3, { message: 'asset.name.min' })
    .max(150, { message: 'asset.name.max' }),
  price: zu.number(
    z
      .number({
        coerce: true,
        required_error: 'asset.price.required',
        invalid_type_error: 'number.not_a_number',
      })
      .min(0.01, { message: 'asset.price.min' })
      .safe({ message: 'number.not_safe' }),
  ),
  description: zu.string(
    z
      .string({ coerce: true, invalid_type_error: 'sring.not_a_string' })
      .max(1000, { message: 'asset.description.max' })
      .optional(),
  ),
  maxQuantity: zu.number(
    z
      .number({
        coerce: true,
        invalid_type_error: 'number.not_a_number',
        required_error: 'asset.max_quantity.required',
      })
      .int({ message: 'number.must_be_integer' })
      .min(1, { message: 'asset.max_quantity.min' })
      .max(100, { message: 'asset.max_quantity.max' })
      .safe({ message: 'number.not_safe' }),
  ),
  teamAsset: zu.boolean(z.boolean({ invalid_type_error: 'boolean.not_a_boolean' })),
  // type: z.nativeEnum(AssetTypeEnum, {
  //   required_error: 'asset.type.required',
  //   invalid_type_error: 'asset.type.invalid',
  // }),
});

export const adminAssetResolver = zodResolver(adminAssetValidationSchema);

export type AdminAssetFormData = z.infer<typeof adminAssetValidationSchema>;
