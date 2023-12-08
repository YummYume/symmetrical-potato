import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Button, Flex, Separator } from '@radix-ui/themes';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { Drawer } from '~/lib/components/Drawer';
import { Lightswitch } from '~/lib/components/Lightswitch';
import { Locale } from '~/lib/components/Locale';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { Header } from '~/lib/components/layout/Header';
import { UserDropdown } from '~/lib/components/layout/UserDropdown';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { Link } from '~components/Link';

import type { DataFunctionArgs, SerializeFrom } from '@remix-run/node';

export async function loader({ context }: DataFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  return {
    user,
    locale: context.locale,
    useDarkMode: context.useDarkMode,
  };
}

export type Loader = typeof loader;

const Menu = ({
  isChangingPreferences,
  locale,
  setIsChangingPreferences,
  useDarkMode,
  user,
}: {
  isChangingPreferences: boolean;
  locale: SerializeFrom<Loader>['locale'];
  setIsChangingPreferences: Dispatch<SetStateAction<boolean>>;
  useDarkMode: SerializeFrom<Loader>['useDarkMode'];
  user: SerializeFrom<Loader>['user'];
}) => {
  const { t } = useTranslation();
  const submit = useSubmit();

  return (
    <Flex align="center" gap="4" justify="end">
      <Form
        method="post"
        className="flex items-center justify-end gap-4"
        onChange={(event) => {
          setIsChangingPreferences(true);
          submit(event.currentTarget, {
            navigate: false,
            unstable_viewTransition: true,
          });
        }}
      >
        <Locale defaultValue={locale} disabled={isChangingPreferences} />
        <Lightswitch defaultChecked={useDarkMode} disabled={isChangingPreferences} />
        <noscript>
          <SubmitButton text={t('submit')} />
        </noscript>
      </Form>

      {user && (
        <UserDropdown isAdmin={user.roles.includes('ROLE_ADMIN')} username={user.username} />
      )}
    </Flex>
  );
};

export default function Layout() {
  const { user, locale, useDarkMode } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const [isChangingPreferences, setIsChangingPreferences] = useState(false);

  const LINKS = [
    { to: '/dashboard', label: t('dashboard') },
    { to: '/map', label: t('map') },
  ];

  useEffect(() => {
    setIsChangingPreferences(false);
  }, [locale, useDarkMode]);

  return (
    <Header>
      <Flex align="center" justify="between">
        <Link to="/dashboard" className="w-fit text-7" unstyled>
          Crime.net
        </Link>
        <div className="flex items-center gap-x-4 gap-y-2 md:hidden">
          <Drawer
            position="right"
            trigger={
              <Button aria-label={t('open-menu')} variant="soft">
                <HamburgerMenuIcon width="24" height="24" />
              </Button>
            }
          >
            <Menu
              isChangingPreferences={isChangingPreferences}
              locale={locale}
              setIsChangingPreferences={setIsChangingPreferences}
              useDarkMode={useDarkMode}
              user={user}
            />
            <Separator className="!w-full" />
            <nav aria-label={t('common.navigation')} className="md:hidden">
              <ul>
                {LINKS.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Drawer>
        </div>
        <div className="hidden items-center gap-4 md:flex md:flex-row-reverse">
          <Menu
            isChangingPreferences={isChangingPreferences}
            locale={locale}
            setIsChangingPreferences={setIsChangingPreferences}
            useDarkMode={useDarkMode}
            user={user}
          />
        </div>
      </Flex>
      <nav className="hidden md:block">
        <ul className="flex gap-4">
          {LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link to={to}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </Header>
  );
}