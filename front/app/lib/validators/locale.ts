import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { ALLOWED_LOCALES } from '~utils/locale';

export const localeValidationSchema = zfd.formData({
  locale: zfd.text(
    z.enum(ALLOWED_LOCALES, {
      required_error: 'locale.locale.required',
      invalid_type_error: 'locale.locale.invalid',
    }),
  ),
});
