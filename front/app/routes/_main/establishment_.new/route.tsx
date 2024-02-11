import { Container, Grid } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

export default function New() {
  const { t } = useTranslation();

  return (
    <main className="py-10">
      <Container className="space-y-16">
        <Grid width="100%" columns={{ initial: '1', md: '2' }} gap="3"></Grid>
      </Container>
    </main>
  );
}
