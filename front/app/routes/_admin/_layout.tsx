import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { Form, Outlet, useLoaderData, useSubmit } from '@remix-run/react';
import { useEffect, useState, type ComponentProps, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Drawer } from '~/lib/components/Drawer';
import { Lightswitch } from '~/lib/components/Lightswitch';
import { Locale } from '~/lib/components/Locale';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { Header } from '~/lib/components/layout/Header';
import { UserDropdown } from '~/lib/components/layout/UserDropdown';
import { denyAdminAccessUnlessGranted } from '~/lib/utils/security.server';
import { links as rootLinks } from '~/root';
import { Link, NavLink, NavLinkActiveIndicator } from '~components/Link';
import adminStyles from '~styles/admin.css';

import type { LinksFunction, LoaderFunctionArgs, SerializeFrom } from '@remix-run/node';

export async function loader({ context }: LoaderFunctionArgs) {
  const user = denyAdminAccessUnlessGranted(context.user);

  return {
    user,
    locale: context.locale,
    useDarkMode: context.useDarkMode,
  };
}

export type Loader = typeof loader;

export const links: LinksFunction = () => [
  ...rootLinks(),
  { rel: 'stylesheet', href: adminStyles },
];

const Menu = ({
  isChangingPreferences,
  locale,
  onChange,
  useDarkMode,
  user,
}: {
  isChangingPreferences: boolean;
  locale: SerializeFrom<Loader>['locale'];
  onChange: ComponentProps<typeof Form>['onChange'];
  useDarkMode: SerializeFrom<Loader>['useDarkMode'];
  user: SerializeFrom<Loader>['user'];
}) => {
  const { t } = useTranslation();

  return (
    <Flex align="center" gap="4" justify="end">
      <Form method="post" className="flex items-center justify-end gap-4" onChange={onChange}>
        <Locale defaultValue={locale} disabled={isChangingPreferences} />
        <Lightswitch defaultChecked={useDarkMode} disabled={isChangingPreferences} />
        <noscript>
          <SubmitButton text={t('submit')} />
        </noscript>
      </Form>

      <UserDropdown username={user.username}>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <Link className="w-full" to="/profile" unstyled>
            {t('my_profile')}
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Link className="w-full" to="/account" unstyled>
            {t('my_account')}
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Link className="w-full" to="/contractor-request" unstyled>
            {t('my_contractor_request')}
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <Link className="w-full" to="/admin" unstyled>
            {t('admin')}
          </Link>
        </DropdownMenu.Item>
      </UserDropdown>
    </Flex>
  );
};

export default function AdminLayout() {
  const { user, locale, useDarkMode } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const [isChangingPreferences, setIsChangingPreferences] = useState(false);
  const submit = useSubmit();
  const LINKS = [
    { to: '/admin', label: t('home') },
    { to: '/admin/users', label: t('users') },
    { to: '/admin/contractor_requests', label: t('contractor_requests') },
    { to: '/admin/heists', label: t('heists') },
    { to: '/admin/locations', label: t('locations') },
    { to: '/admin/assets', label: t('assets') },
    { to: '/admin/establishments', label: t('establishments') },
  ];

  const onChange = (event: FormEvent<HTMLFormElement>) => {
    setIsChangingPreferences(true);
    submit(event.currentTarget, {
      navigate: false,
      unstable_viewTransition: true,
    });
  };

  useEffect(() => {
    setIsChangingPreferences(false);
  }, [locale, useDarkMode]);

  return (
    <>
      <Header>
        <Flex align="center" justify="between">
          <Link to="/admin" className="w-fit text-7" unstyled>
            {t('admin')}
          </Link>
          <div className="flex items-center gap-x-4 gap-y-2 md:hidden">
            <Drawer
              position="right"
              trigger={
                <Button aria-label={t('open_menu')} variant="soft">
                  <HamburgerMenuIcon width="24" height="24" />
                </Button>
              }
            >
              <Menu
                isChangingPreferences={isChangingPreferences}
                locale={locale}
                onChange={onChange}
                useDarkMode={useDarkMode}
                user={user}
              />
            </Drawer>
          </div>
          <div className="hidden items-center gap-4 md:flex md:flex-row-reverse">
            <Menu
              isChangingPreferences={isChangingPreferences}
              locale={locale}
              onChange={onChange}
              useDarkMode={useDarkMode}
              user={user}
            />
          </div>
        </Flex>
        <nav className="hidden md:block">
          <ul className="flex gap-4">
            {LINKS.map(({ to, label }, index) => (
              <li key={to}>
                <NavLink to={to} end={index === 0} className="group">
                  {({ isActive, isPending }) => (
                    <>
                      <span>{label}</span>
                      <NavLinkActiveIndicator
                        isActive={isActive}
                        isPending={isPending}
                        className="transition-colors group-hover:bg-accent-8 group-focus-visible:bg-accent-8 motion-reduce:transition-none"
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </Header>
      <Outlet />
    </>
  );
}
