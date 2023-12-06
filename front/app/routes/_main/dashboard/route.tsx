import { Heading, Section } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <Section>
      <Heading align="center" as="h1" size="9">
        {t('dashboard')}
      </Heading>
    </Section>
  );
}
