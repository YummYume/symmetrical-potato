import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { ALLOWED_LOCALES } from '~utils/locale';

import type { TFunction } from 'i18next';

export const getLocaleValidationSchema = (t: TFunction) => {
  return zfd.formData({
    locale: zfd.text(
      z.enum(ALLOWED_LOCALES, {
        required_error: t('locale.locale.required', { ns: 'validators' }),
        invalid_type_error: t('locale.locale.invalid', { ns: 'validators' }),
      }),
    ),
  });
};
