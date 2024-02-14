import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';

import { deleteAsset } from '~/lib/api/asset';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { FLASH_MESSAGE_KEY } from '~/root';

import type { FlashMessage } from '~/root';

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  if (!params.assetId) {
    throw redirect(`/map/${params.placeId}/heist/${params.heistId}/assets`);
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await deleteAsset(context.client, params.assetId);

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('asset.deleted', { ns: 'flash' }),
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

  return redirect(`/map/${params.placeId}/heist/${params.heistId}/assets/${params.assetId}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export type Action = typeof action;
