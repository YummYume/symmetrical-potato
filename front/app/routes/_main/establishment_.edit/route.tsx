import { TrashIcon } from '@radix-ui/react-icons';
import { Container, Flex, Heading, IconButton } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import Form from '../establishment/Form';

export default function Edit() {
  const { t } = useTranslation();

  return (
    <Container className="space-y-12 px-4 lg:px-0" size="2">
      <main className="space-y-12 py-10">
        <Flex gap="4" justify="center">
          <Heading size="9">{t('establishment.edit')}</Heading>
          <IconButton size="4" color="red">
            <TrashIcon color="white" className="size-10" />
          </IconButton>
        </Flex>
        <Form />
      </main>
    </Container>
  );
}
