import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Blockquote, Button, Flex, Heading, IconButton, ScrollArea, Text } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getEstablishment, updateEstablishment } from '~/lib/api/establishment';
import { HistoryInfoPopover } from '~/lib/components/HistoryInfoPopover';
import { Link } from '~/lib/components/Link';
import { Rating } from '~/lib/components/Rating';
import { FormConfirmDialog } from '~/lib/components/dialog/FormConfirmDialog';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { UserHoverCard } from '~/lib/components/user/UserHoverCard';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getUriId } from '~/lib/utils/path';
import { adminEstablishmentResolver } from '~/lib/validators/admin/establishment';
import { FLASH_MESSAGE_KEY } from '~/root';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~utils/api';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import type { AdminEstablishmentFormData } from '~/lib/validators/admin/establishment';
import type { FlashMessage } from '~/root';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.establishmentId) {
    throw redirect('/admin/establishments');
  }

  try {
    const t = await i18next.getFixedT(request, 'admin');
    const { establishment } = await getEstablishment(context.client, params.establishmentId, true);

    return {
      establishment,
      meta: {
        title: t('meta.establishments_edit.title', {
          ns: 'admin',
        }),
        description: t('meta.establishments_edit.description', {
          ns: 'admin',
        }),
      },
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'establishment')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: 'establishment.not_found',
    });
  }
}

export type Loader = typeof loader;

export const meta: MetaFunction<Loader> = ({ data }) => {
  if (!data) {
    return [];
  }

  return [
    { title: data.meta.title },
    { name: 'description', content: data.meta.description },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.establishmentId) {
    throw redirect('/admin/establishments');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<AdminEstablishmentFormData>(
    request,
    adminEstablishmentResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await updateEstablishment(
      context.client,
      {
        id: `/establishments/${params.establishmentId}`,
        ...data,
      },
      true,
    );

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('establishment.updated', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return json(
      {},
      {
        status: 200,
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCodes(error, [422, 401, 404])) {
      errorMessage = getMessageForErrorStatusCodes(error, [422, 401, 404]);
    } else {
      throw error;
    }
  }

  if (errorMessage) {
    session.flash(FLASH_MESSAGE_KEY, {
      content: errorMessage,
      type: 'error',
    } as FlashMessage);
  }

  return json(
    { errors: {}, receivedValues },
    { status: 401, headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export type Action = typeof action;

export default function EditEstablishment() {
  const { establishment } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const methods = useRemixForm<AdminEstablishmentFormData>({
    mode: 'onSubmit',
    resolver: adminEstablishmentResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: {
      name: establishment.name,
      description: establishment.description,
      minimumWage: establishment.minimumWage,
      minimumWorkTimePerWeek: establishment.minimumWorkTimePerWeek,
      contractorCut: establishment.contractorCut,
      employeeCut: establishment.employeeCut,
      crewCut: establishment.crewCut,
    },
  });

  return (
    <Flex gap="4" direction="column" height="100%">
      <Flex justify="between">
        <Flex gap="2" justify="center" align="center">
          <Heading as="h2">{establishment.name}</Heading>
        </Flex>
        <HistoryInfoPopover
          createdAt={establishment.createdAt}
          createdBy={establishment.createdBy?.username}
          updatedAt={establishment.updatedAt}
          updatedBy={establishment.updatedBy?.username}
        >
          <IconButton aria-label={t('history_info')} size="2" variant="soft" radius="full">
            <InfoCircledIcon width="18" height="18" />
          </IconButton>
        </HistoryInfoPopover>
      </Flex>
      <div className="h-[23.875rem]">
        <ScrollArea type="auto" scrollbars="both">
          <RemixFormProvider {...methods}>
            <form
              method="post"
              className="panel__content-form"
              onSubmit={methods.handleSubmit}
              id="establishment-form"
            >
              <FieldInput type="text" name="name" label={t('establishment.name')} required />
              <TextAreaInput name="description" label={t('establishment.description')} rows={5} />
              <FieldInput
                type="number"
                name="minimumWorkTimePerWeek"
                label={t('establishment.minimum_work_time_per_week')}
                min={1}
                max={84}
                step={1}
                required
              />
              <FieldInput
                type="number"
                name="minimumWage"
                label={t('establishment.minimum_wage')}
                min={1000}
                step={0.01}
                required
              />
              <FieldInput
                type="number"
                name="contractorCut"
                label={t('establishment.contractor_cut')}
                min={1}
                max={99}
                step={0.01}
                required
              />
              <FieldInput
                type="number"
                name="employeeCut"
                label={t('establishment.employee_cut')}
                min={1}
                max={99}
                step={0.01}
                required
              />
              <FieldInput
                type="number"
                name="crewCut"
                label={t('establishment.crew_cut')}
                min={1}
                max={99}
                step={0.01}
                required
              />
              <Flex direction="column" gap="2">
                <Text>{t('owner')}</Text>
                <UserHoverCard
                  username={establishment.contractor.username}
                  description={establishment.contractor.profile.description}
                  mainRole={establishment.contractor.mainRole}
                  globalRating={establishment.contractor.globalRating}
                >
                  <Link
                    to={`/admin/users/${getUriId(establishment.contractor.id)}`}
                    className="w-fit"
                  >
                    {establishment.contractor.username}
                  </Link>
                </UserHoverCard>
              </Flex>
              <Flex direction="column" gap="2">
                <Text>{t('establishment.average_rating')}</Text>
                {establishment.averageRating && (
                  <Rating style={{ maxWidth: 150 }} value={establishment.averageRating} readOnly />
                )}
                {!establishment.averageRating && (
                  <Blockquote>{t('establishment.average_rating.none')}</Blockquote>
                )}
              </Flex>
              <Flex direction="column" gap="2">
                <Text>{t('establishment.review_count')}</Text>
                <Blockquote>{establishment.reviewCount}</Blockquote>
              </Flex>
            </form>
          </RemixFormProvider>
        </ScrollArea>
      </div>
      <Flex justify="between" align="center" gap="4" className="mt-auto" role="group">
        <Flex align="center" gap="4">
          <FormConfirmDialog
            formId="establishment-delete"
            action="delete"
            title={t('delete')}
            description={t('establishment.delete.confirm', {
              ns: 'admin',
            })}
          >
            <Button type="button" color="red">
              {t('delete')}
            </Button>
          </FormConfirmDialog>
        </Flex>
        <SubmitButton
          form="establishment-form"
          color="green"
          text={t('save')}
          submittingText={t('saving')}
        />
      </Flex>
    </Flex>
  );
}
