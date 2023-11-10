import { z } from 'zod';
import { zfd } from 'zod-form-data';

import type { TFunction } from 'i18next';

export const getLoginValidationSchema = (t: TFunction) => {
  return zfd.formData({
    username: zfd.text(
      z.string({ required_error: t('login.username.required', { ns: 'validators' }) }),
    ),
    password: zfd.text(
      z.string({ required_error: t('login.password.required', { ns: 'validators' }) }),
    ),
  });
};
