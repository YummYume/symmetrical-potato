import { Avatar, Box, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useLoaderData } from '@remix-run/react';

import Map from '~/lib/components/Map';
// import { MapTest } from '~/lib/components/MapTest';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { DataFunctionArgs } from '@remix-run/node';

export async function loader({ context }: DataFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  return {
    user,
    apiKey: process.env.GOOGLE_MAPS_KEY || '',
  };
}

export type Loader = typeof loader;

export let handle = {
  i18n: ['common'],
};

const CardTest = () => (
  <Card size="3" style={{ width: 500 }}>
    <Flex gap="4" align="center">
      <Avatar size="5" radius="full" fallback="T" color="indigo" />
      <Box>
        <Text as="div" size="4" weight="bold">
          Teodros Girmay
        </Text>
        <Text as="div" size="4" color="gray">
          Engineering
        </Text>
      </Box>
    </Flex>
  </Card>
);

export default function Dashboard() {
  const { user, apiKey } = useLoaderData<Loader>();

  return (
    <div className="relative w-full">
      <Heading as="h1">Hi {user.username}</Heading>
      <img
        className="absolute right-0 top-20"
        src="/favicon.ico"
        alt="Remix Logo"
        style={{
          viewTransitionName: 'logo',
        }}
      />
      <div className="flex">
        <div>
          <CardTest />
          <CardTest />
          <CardTest />
          <CardTest />
        </div>
        <Map apiKey={apiKey} />
      </div>
    </div>
  );
}
