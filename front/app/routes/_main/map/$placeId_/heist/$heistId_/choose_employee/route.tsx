import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { getValidatedFormData } from 'remix-hook-form';

import { getCrewMemberByUserAndHeistPartial } from '~/lib/api/crew-member';
import { chooseEmployeeHeist, getHeistPartial } from '~/lib/api/heist';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { chooseEmployeeResolver } from '~/lib/validators/prepare-heist';
import { FLASH_MESSAGE_KEY } from '~/root';

import type { ChooseEmployeeFormData } from '~/lib/validators/prepare-heist';
import type { FlashMessage } from '~/root';

export async function action({ request, context, params }: ActionFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.ADMIN, ROLES.HEISTER]);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, ['validators', 'flash']);
  const { errors, data } = await getValidatedFormData<ChooseEmployeeFormData>(
    request,
    chooseEmployeeResolver,
  );

  let errorMessage: string | null = null;
  const session = await getSession(request.headers.get('Cookie'));

  if (errors) {
    return redirect(`/map/${params.placeId}/heist/${params.heistId}/prepare`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  try {
    let crewMember = await getCrewMemberByUserAndHeistPartial(context.client, {
      heistId: params.heistId,
      userId: user.id,
    });

    if (!crewMember) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.prepare.not_in_crew', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}/heist/${params.heistId}/prepare`, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }

    const {
      heist: { employee },
    } = await getHeistPartial(
      context.client,
      params.heistId,
      `
      employee {
        id
      }
    `,
    );

    if (employee) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.prepare.employee.aleary_set', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}/heist/${params.heistId}/prepare`, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }

    if (!data.employee) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.prepare.employee.missing', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}/heist/${params.heistId}/prepare`, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }

    await chooseEmployeeHeist(context.client, {
      id: params.heistId,
      employeeId: data.employee,
    });

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('heist.prepare.employee.chosen_successfully', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect(`/map/${params.placeId}/heist/${params.heistId}/prepare`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCodes(error, [422, 400, 404, 403])) {
      errorMessage = getMessageForErrorStatusCodes(error, [422, 400, 404, 403]);
    } else {
      throw error;
    }

    if (errorMessage) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: errorMessage,
        type: 'error',
      } as FlashMessage);
    }

    return redirect(`/map/${params.placeId}/heist/${params.heistId}/prepare`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
}
