import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex, Separator, Text } from '@radix-ui/themes';
import { Form, Outlet, useLoaderData, useSubmit } from '@remix-run/react';
import { useEffect, useState, type FormEvent, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { Drawer } from '~/lib/components/Drawer';
import { Lightswitch } from '~/lib/components/Lightswitch';
import { Locale } from '~/lib/components/Locale';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { Header } from '~/lib/components/layout/Header';
import { UserDropdown } from '~/lib/components/layout/UserDropdown';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { Link, NavLink, NavLinkActiveIndicator } from '~components/Link';

import type { LoaderFunctionArgs, MetaFunction, SerializeFrom } from '@remix-run/node';

export async function loader({ context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  return {
    user,
    locale: context.locale,
    useDarkMode: context.useDarkMode,
  };
}

export type Loader = typeof loader;

export const meta: MetaFunction<Loader> = () => {
  return [{ name: 'robots', content: 'noindex, nofollow' }];
};

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
      <Text as="span" size="2">
        ${user.balance.toLocaleString()}
      </Text>

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
          <Link className="w-full" to={`/profile/${getUriId(user.id)}`} unstyled>
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
        {user.roles.includes(ROLES.EMPLOYEE) ||
          (user.roles.includes(ROLES.USER) && (
            <DropdownMenu.Item>
              <Link className="w-full" to="/job" unstyled>
                {t('my_job')}
              </Link>
            </DropdownMenu.Item>
          ))}
        {user.roles.includes(ROLES.ADMIN) && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>
              <Link className="w-full" to="/admin" unstyled>
                {t('admin')}
              </Link>
            </DropdownMenu.Item>
          </>
        )}
      </UserDropdown>
    </Flex>
  );
};

export default function Layout() {
  const { user, locale, useDarkMode } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const [isChangingPreferences, setIsChangingPreferences] = useState(false);
  const submit = useSubmit();
  const LINKS = [
    { to: '/dashboard', label: t('dashboard') },
    { to: '/map', label: t('map') },
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
          <Link to="/dashboard" className="w-fit text-7" unstyled>
            Crime.net
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
              <Separator className="!w-full" />
              <nav aria-label={t('navigation')} className="md:hidden">
                <ul>
                  {LINKS.map(({ to, label }) => (
                    <li key={to}>
                      <NavLink to={to} className="group">
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
            {LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className="group">
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
