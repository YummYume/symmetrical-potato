import { PersonIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { Form } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export const UserDropdown = ({
  username,
  children,
}: {
  username: string;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button aria-label={t('user_menu')} variant="soft">
          <PersonIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item className="hover:bg-transparent hover:text-[inherit]">
          {t('logged-in-as')} {username}
        </DropdownMenu.Item>

        {children}

        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red">
          <Form method="post" action="/logout" className="contents" unstable_viewTransition>
            <button className="w-full text-left" type="submit">
              {t('logout')}
            </button>
          </Form>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
