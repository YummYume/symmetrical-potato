import { Button, Dialog, Flex, Switch, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { ComponentProps, SetStateAction } from 'react';

export type MapSettingsModalProps = {
  showMarkers: boolean;
  setShowMarkers: (value: SetStateAction<boolean>) => void;
  children: React.ReactNode;
} & ComponentProps<typeof Dialog.Root>;

export const MapSettingsModal = ({
  children,
  showMarkers,
  setShowMarkers,
  ...rest
}: MapSettingsModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog.Root {...rest}>
      <Dialog.Trigger>{children}</Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>{t('map.settings')}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {t('map.settings.description')}
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <Text as="label" size="2">
            <Flex gap="2">
              <Switch
                checked={showMarkers}
                onCheckedChange={(checked) => {
                  setShowMarkers(checked);
                  localStorage.setItem('showMarkers', checked ? 'true' : 'false');
                }}
              />{' '}
              {t('map.settings.show_markers')}
            </Flex>
          </Text>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="blue">
              {t('close')}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
