import { redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';

import { createCrewMember, getCrewMemberByUserAndHeist } from '~/lib/api/crew-member';
import { getHeistPartial } from '~/lib/api/heist';
import { HeistPhaseEnum } from '~/lib/api/types';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { FLASH_MESSAGE_KEY } from '~/root';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { FlashMessage } from '~/root';

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
  const user = denyAccessUnlessGranted(context.user, ROLES.HEISTER);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, ['flash']);
  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    const { heist } = await getHeistPartial(
      context.client,
      params.heistId,
      `
      phase
      startAt
    `,
    );

    if (new Date(heist.startAt) < new Date()) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.join_not_allowed', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}`, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }
    if (heist.phase !== HeistPhaseEnum.Planning) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.join_not_allowed', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}`, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }

    const crewMember = await getCrewMemberByUserAndHeist(context.client, {
      heistId: params.heistId,
      userId: user.id,
    });

    if (crewMember) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.already_in_crew', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}`, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }

    await createCrewMember(context.client, { heist: params.heistId, user: user.id });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('heist.join_successfully', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect(`/map/${params.placeId}`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCodes(error, [422, 401, 404, 403, 400])) {
      errorMessage = getMessageForErrorStatusCodes(error, [422, 401, 404, 403, 400]);
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

  return redirect(`/map/${params.placeId}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};
