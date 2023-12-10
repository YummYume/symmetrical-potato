import { Select } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { FieldSelect } from '~components/form/FieldSelect';
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
    <FieldSelect
      name="locale"
      required
      label={t('change_locale')}
      hideLabel
      defaultValue={defaultValue}
      disabled={disabled}
    >
      <Select.Content>
        {ALLOWED_LOCALES.map((allowedLocale) => {
          const Icon = FLAGS[allowedLocale];

          return (
            <Select.Item key={allowedLocale} value={allowedLocale}>
              <span className="sr-only">{getLocaleLabel(allowedLocale)}</span>
              <Icon aria-hidden="true" />
            </Select.Item>
          );
        })}
      </Select.Content>
    </FieldSelect>
  );
};
