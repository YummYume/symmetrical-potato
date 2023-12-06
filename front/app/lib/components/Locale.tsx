import { Select } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { FieldSelect } from '~components/form/FieldSelect';
import { ALLOWED_LOCALES, getLocaleLabel } from '~utils/locale';

const FLAGS = {
  'en-GB': 'uk',
  'fr-FR': 'fr',
};

export const Locale = ({ defaultValue, disabled }: { defaultValue: string; disabled: boolean }) => {
  const { t } = useTranslation();

  return (
    <FieldSelect
      name="locale"
      required
      label={t('change_locale')}
      hideLabel
      defaultValue={defaultValue}
      disabled={disabled}
    >
      <Select.Content>
        {ALLOWED_LOCALES.map((allowedLocale) => (
          <Select.Item key={allowedLocale} value={allowedLocale}>
            <span className="sr-only">{getLocaleLabel(allowedLocale)}</span>
            <img
              alt={getLocaleLabel(allowedLocale)}
              decoding="async"
              height="24"
              loading="lazy"
              src={`img/flags/${FLAGS[allowedLocale]}.png`}
              width="24"
            />
          </Select.Item>
        ))}
      </Select.Content>
    </FieldSelect>
  );
};
