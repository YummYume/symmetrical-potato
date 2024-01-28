import { Select as RadixSelect } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Select } from '~components/form/Select';
import { ALLOWED_LOCALES, getLocaleLabel } from '~utils/locale';

import FlagFr from './icon/FlagFr';
import FlagUk from './icon/FlagUk';

const FLAGS = {
  'en-GB': FlagUk,
  'fr-FR': FlagFr,
};

export const Locale = ({ defaultValue, disabled }: { defaultValue: string; disabled: boolean }) => {
  const { t } = useTranslation();

  return (
    <Select
      name="locale"
      required
      label={t('change_locale')}
      hideLabel
      defaultValue={defaultValue}
      disabled={disabled}
    >
      <RadixSelect.Content>
        {ALLOWED_LOCALES.map((allowedLocale) => {
          const Icon = FLAGS[allowedLocale];

          return (
            <RadixSelect.Item key={allowedLocale} value={allowedLocale}>
              <span className="sr-only">{getLocaleLabel(allowedLocale)}</span>
              <Icon aria-hidden="true" />
            </RadixSelect.Item>
          );
        })}
      </RadixSelect.Content>
    </Select>
  );
};
