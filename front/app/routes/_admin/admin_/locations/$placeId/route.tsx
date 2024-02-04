import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Blockquote, Button, Flex, Heading, IconButton, ScrollArea, Text } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getLocation, updateLocation } from '~/lib/api/location';
import { HistoryInfoPopover } from '~/lib/components/HistoryInfoPopover';
import { Rating } from '~/lib/components/Rating';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { adminLocationResolver } from '~/lib/validators/admin/location';
import { FLASH_MESSAGE_KEY } from '~/root';
import { FormAlertDialog } from '~components/dialog/FormAlertDialog';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~utils/api';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { AdminLocationFormData } from '~/lib/validators/admin/location';
import type { FlashMessage } from '~/root';

export async function loader({ context, params }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.placeId) {
    throw redirect('/admin/locations');
  }

  try {
    const response = await getLocation(context.client, params.placeId);

    return {
      location: response.location,
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'locations')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: 'location.not_found',
    });
  }
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.placeId) {
    throw redirect('/admin/locations');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<AdminLocationFormData>(
    request,
    adminLocationResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await updateLocation(context.client, {
      id: `/locations/${params.placeId}`,
      ...data,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('location.updated', { ns: 'flash' }),
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

export default function EditLocation() {
  const { location } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const methods = useRemixForm<AdminLocationFormData>({
    mode: 'onSubmit',
    resolver: adminLocationResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: {
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name,
    },
  });

  return (
    <Flex gap="4" direction="column" height="100%">
      <Flex justify="between">
        <Flex gap="2" justify="center" align="center">
          <Heading as="h2">{location.name ?? location.address}</Heading>
        </Flex>
        <HistoryInfoPopover
          createdAt={location.createdAt}
          createdBy={location.createdBy?.username}
          updatedAt={location.updatedAt}
          updatedBy={location.updatedBy?.username}
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
              id="location-form"
            >
              <Flex direction="column" gap="2">
                <Text>{t('location.place_id')}</Text>
                <Blockquote>{location.placeId}</Blockquote>
              </Flex>
              <FieldInput type="text" name="name" label={t('location.name')} required />
              <FieldInput type="text" name="address" label={t('location.address')} />
              <FieldInput
                type="number"
                name="latitude"
                label={t('location.latitude')}
                min={-90}
                max={90}
                step={0.0000001}
                required
              />
              <FieldInput
                type="number"
                name="longitude"
                label={t('location.longitude')}
                min={-180}
                max={180}
                step={0.0000001}
                required
              />
              <Flex direction="column" gap="2">
                <Text>{t('location.average_rating')}</Text>
                {location.averageRating && (
                  <Rating style={{ maxWidth: 150 }} value={location.averageRating} readOnly />
                )}
                {!location.averageRating && (
                  <Blockquote>{t('location.average_rating.none')}</Blockquote>
                )}
              </Flex>
              <Flex direction="column" gap="2">
                <Text>{t('location.review_count')}</Text>
                <Blockquote>{location.reviewCount}</Blockquote>
              </Flex>
            </form>
          </RemixFormProvider>
        </ScrollArea>
      </div>
      <Flex justify="between" align="center" gap="4" className="mt-auto" role="group">
        <Flex align="center" gap="4">
          <Form
            id="location-delete-form"
            action="delete"
            method="post"
            className="hidden"
            unstable_viewTransition
          />
          <FormAlertDialog
            title={t('delete')}
            description={t('location.delete.confirm', {
              ns: 'admin',
            })}
            formId="location-delete-form"
          >
            <Button type="button" color="red">
              {t('delete')}
            </Button>
          </FormAlertDialog>
        </Flex>
        <SubmitButton
          form="location-form"
          color="green"
          text={t('save')}
          submittingText={t('saving')}
        />
      </Flex>
    </Flex>
  );
}
