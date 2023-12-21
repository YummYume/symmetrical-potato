import * as Dialog from '@radix-ui/react-dialog';
import { Heading } from '@radix-ui/themes';
import { type DataFunctionArgs } from '@remix-run/node';

import { ROLES, denyAccessUnlessGranted } from '~utils/security.server';

export async function loader({ context, params }: DataFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  return {
    locale: context.locale,
  };
}

export default function Edit() {
  return (
    <Dialog.Title asChild>
      <Heading as="h2" size="8">
        Edit
      </Heading>
    </Dialog.Title>
  );
}
