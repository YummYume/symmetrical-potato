import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { getValidatedFormData } from 'remix-hook-form';

import { updateAsset } from '~/lib/api/asset';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { ROLES } from '~/lib/utils/roles';
import { assetResolver, type AssetFormData } from '~/lib/validators/asset';
import { FLASH_MESSAGE_KEY } from '~/root';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~utils/api';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { FlashMessage } from '~/root';

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<AssetFormData>(
    request,
    assetResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await updateAsset(context.client, {
      ...data,
      id: `/assets/${params.assetId}`,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('asset.updated', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect(`/map/${params.placeId}/heist/${params.heistId}/assets`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
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
