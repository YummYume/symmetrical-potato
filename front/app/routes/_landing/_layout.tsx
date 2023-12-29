import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs, type SerializeFrom } from '@remix-run/node';
import { Form, Outlet, useLoaderData, useSubmit } from '@remix-run/react';
import { useEffect, useState, type FormEvent, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { Drawer } from '~/lib/components/Drawer';
import { Lightswitch } from '~/lib/components/Lightswitch';
import { Locale } from '~/lib/components/Locale';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { Header } from '~/lib/components/layout/Header';
import { Link } from '~components/Link';

export async function loader({ context }: LoaderFunctionArgs) {
  if (context.user) {
    throw redirect('/dashboard');
  }

  return {
    locale: context.locale,
    useDarkMode: context.useDarkMode,
  };
}

export type Loader = typeof loader;

const Menu = ({
  isChangingPreferences,
  locale,
  onChange,
  useDarkMode,
}: {
  isChangingPreferences: boolean;
  locale: SerializeFrom<Loader>['locale'];
  onChange: ComponentProps<typeof Form>['onChange'];
  useDarkMode: SerializeFrom<Loader>['useDarkMode'];
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Flex align="center" gap="4" justify="end">
        <Form method="post" className="flex items-center justify-end gap-4" onChange={onChange}>
          <Locale defaultValue={locale} disabled={isChangingPreferences} />
          <Lightswitch defaultChecked={useDarkMode} disabled={isChangingPreferences} />
          <noscript>
            <SubmitButton text={t('submit')} />
          </noscript>
        </Form>
      </Flex>
      <nav>
        <ul className="grid items-center gap-4 text-right md:grid-flow-col">
          <li>
            <Link to="/login" prefetch="intent">
              {t('login')}
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default function Layout() {
  const { locale, useDarkMode } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const [isChangingPreferences, setIsChangingPreferences] = useState(false);
  const submit = useSubmit();

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
          <Link to="/" className="w-fit text-7" unstyled>
            Symmetrical Potato
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
                onChange={onChange}
                useDarkMode={useDarkMode}
              />
            </Drawer>
          </div>
          <div className="hidden items-center gap-4 md:flex md:flex-row-reverse">
            <Menu
              isChangingPreferences={isChangingPreferences}
              locale={locale}
              onChange={onChange}
              useDarkMode={useDarkMode}
            />
          </div>
        </Flex>
      </Header>
      <Outlet />
    </>
  );
}
