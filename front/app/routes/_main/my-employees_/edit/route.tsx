import { TrashIcon } from '@radix-ui/react-icons';
import { Button, Container, Flex, Heading, IconButton } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';

export default function Edit() {
  const { t } = useTranslation();
  const methods = useRemixForm({
    mode: 'onSubmit',
  });

  return (
    <Container className="space-y-12 px-4 lg:px-0" size="1">
      <main className="space-y-12 py-10">
        <Flex gap="4" justify="center">
          <Heading size="9">{t('employee.edit')}</Heading>
          <IconButton size="4" color="red">
            <TrashIcon color="white" className="size-10" />
          </IconButton>
        </Flex>
        <RemixFormProvider {...methods}>
          <form onSubmit={methods.handleSubmit} className="grid justify-items-center gap-8">
            <div className="grid w-full gap-4">
              <FieldInput type="text" name="codeName" label={t('employee.code_name')} required />
              <TextAreaInput name="description" label={t('asset.description')} rows={5} />
            </div>
            <Button className="w-full max-w-xs" type="submit">
              {t('submit')}
            </Button>
          </form>
        </RemixFormProvider>
      </main>
    </Container>
  );
}
