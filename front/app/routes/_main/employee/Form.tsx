import { Button } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';

export default function Form() {
  const { t } = useTranslation();

  const methods = useRemixForm({
    mode: 'onSubmit',
  });

  return (
    <RemixFormProvider {...methods}>
      <form className="grid justify-items-center gap-8">
        <div className="grid w-full gap-4">
          <FieldInput type="text" name="codeName" label={t('employee.code_name')} required />
          <TextAreaInput name="description" label={t('asset.description')} rows={5} />
        </div>
        <Button className="w-full max-w-xs" type="submit">
          {t('submit')}
        </Button>
      </form>
    </RemixFormProvider>
  );
}
