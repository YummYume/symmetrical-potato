import { Button, Dialog, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { ComponentProps } from 'react';

export type MapHelpModalProps = {
  children: React.ReactNode;
} & ComponentProps<typeof Dialog.Root>;

const MapSections = ({ sections }: { sections: string[] }) => {
  const { t } = useTranslation();

  return (
    <>
      {sections.map((section) => (
        <Flex direction="column" key={section}>
          <Heading as="h4" size="3" weight="bold">
            {t(`map.help.${section}`)}
          </Heading>
          <Text color="gray" size="2">
            {t(`map.help.${section}_description`)}
          </Text>
        </Flex>
      ))}
    </>
  );
};

export const MapHelpModal = ({ children, ...rest }: MapHelpModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog.Root {...rest}>
      <Dialog.Trigger>{children}</Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>{t('map.help')}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {t('map.help.description')}
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <Heading as="h3" size="4" weight="bold">
            {t('map.help.controls')}
          </Heading>
          <MapSections sections={['location_list', 'heist_list', 'filters', 'settings']} />
          <Heading as="h3" size="4" weight="bold">
            {t('map.help.on_map')}
          </Heading>
          <MapSections sections={['markers', 'drawer', 'unknow_location']} />
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
