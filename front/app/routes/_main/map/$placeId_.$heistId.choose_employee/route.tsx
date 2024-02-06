import { json } from '@remix-run/node';
import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { getValidatedFormData } from 'remix-hook-form';

import { chooseEmployeeHeist, getHeistPartial } from '~/lib/api/heist';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { FLASH_MESSAGE_KEY } from '~/root';

import type { FlashMessage } from '~/root';

export async function action({ request, context, params }: ActionFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.ADMIN, ROLES.HEISTER]);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, ['validators', 'flash']);
  const { errors, data } = await getValidatedFormData<PrepareHeistFormData>(
    request,
    prepareHeistResolver,
  );

  if (errors) {
    return json({ errors }, { status: 400 });
  }

  let errorMessage: string | null = null;
  const session = await getSession(request.headers.get('Cookie'));

  try {
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

      return json(
        { errors: {} },
        { status: 400, headers: { 'Set-Cookie': await commitSession(session) } },
      );
    }

    if (!data.employee) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.prepare.employee.missing', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return json(
        { errors: {} },
        { status: 400, headers: { 'Set-Cookie': await commitSession(session) } },
      );
    }

    await chooseEmployeeHeist(context.client, {
      id: params.heistId,
      employeeId: data.employee,
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

    return json(
      { errors: {} },
      { status: 401, headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
