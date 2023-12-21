import * as Dialog from '@radix-ui/react-dialog';
import { Heading, Section } from '@radix-ui/themes';
import { type DataFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { Link } from '~/lib/components/Link';
import { ROLES, denyAccessUnlessGranted } from '~utils/security.server';

export async function loader({ context, params }: DataFunctionArgs) {
  denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);
  return {
    placeId: params.placeId,
    locale: context.locale,
  };
}

export type Loader = typeof loader;

export default function Add() {
  const { placeId } = useLoaderData<Loader>();
  return (
    <div>
      <Dialog.Title asChild>
        <Heading as="h2" size="8">
          Add
        </Heading>
      </Dialog.Title>
      <Section className="space-y-3" size="1">
        <Link to={`/map/${placeId}`}>retour</Link>
      </Section>
    </div>
  );
}
