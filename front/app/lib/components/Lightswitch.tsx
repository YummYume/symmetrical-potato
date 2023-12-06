import * as Checkbox from '@radix-ui/react-checkbox';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

export const Lightswitch = ({
  defaultChecked,
  disabled,
}: {
  defaultChecked: boolean;
  disabled: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Checkbox.Root
      aria-label={t('enable_dark_mode')}
      defaultChecked={defaultChecked}
      disabled={disabled}
      name="darkMode"
      value="true"
    >
      {defaultChecked ? <MoonIcon width="24" height="24" /> : <SunIcon width="24" height="24" />}
    </Checkbox.Root>
  );
};
