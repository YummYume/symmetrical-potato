import { Container, Heading } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import Form from '../establishment/Form';

export default function New() {
  const { t } = useTranslation();

  return (
    <Container className="space-y-12 px-4 lg:px-0" size="2">
      <main className="space-y-12 py-10">
        <Heading className="text-center" size="9">
          {t('establishment.new')}
        </Heading>
        <Form />
      </main>
    </Container>
  );
}
