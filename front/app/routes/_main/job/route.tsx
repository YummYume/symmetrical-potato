import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';
import { Blockquote, Button, Callout, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { EmployeeStatusEnum } from '~/lib/api/types';
import { Link } from '~/lib/components/Link';
import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';
import { i18next } from '~/lib/i18n/index.server';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.HEISTER, ROLES.EMPLOYEE]);
  const t = await i18next.getFixedT(request, 'common');

  return json({
    user,
    meta: {
      title: t('meta.my_job.title'),
      description: t('meta.my_job.description'),
    },
  });
}

export type Loader = typeof loader;

export const meta: MetaFunction<Loader> = ({ data }) => {
  if (!data) {
    return [];
  }

  return [
    { title: data.meta.title },
    { name: 'description', content: data.meta.description },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

export default function Job() {
  const { t } = useTranslation();
  const { user } = useLoaderData<Loader>();

  return (
    <main className="py-10">
      <Container>
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {t('my_job')}
          </Heading>
          <div className="text-center">
            <Flex justify="center" align="center" direction="column" gap="3">
              {!user.employee && (
                <>
                  <InfoCircledIcon aria-hidden="true" width="46" height="46" />
                  <div>
                    <Heading as="h2" size="5" className="font-semibold text-gray-900 mt-2">
                      {t('my_job.no_job')}
                    </Heading>
                    <Text as="p" mt="2">
                      {t('my_job.no_job.description')}
                    </Text>
                  </div>
                  <Callout.Root color="orange">
                    <Callout.Icon>
                      <ExclamationTriangleIcon />
                    </Callout.Icon>
                    <Callout.Text>{t('my_job.warning_message')}</Callout.Text>
                  </Callout.Root>
                  <div className="mt-6">
                    <Link
                      to="/establishments"
                      unstyled
                      data-accent-color="green"
                      className="rt-reset rt-BaseButton rt-Button rt-r-size-2 rt-variant-surface"
                    >
                      {t('my_job.find_establishment')}
                    </Link>
                  </div>
                </>
              )}
              {user.employee && (
                <>
                  {user.employee.status === EmployeeStatusEnum.Pending && (
                    <QuestionMarkCircledIcon aria-hidden="true" width="46" height="46" />
                  )}
                  {user.employee.status === EmployeeStatusEnum.Active && (
                    <CheckCircledIcon
                      aria-hidden="true"
                      className="text-green-10"
                      width="46"
                      height="46"
                    />
                  )}
                  {user.employee.status === EmployeeStatusEnum.Rejected && (
                    <CrossCircledIcon
                      aria-hidden="true"
                      className="text-red-10"
                      width="46"
                      height="46"
                    />
                  )}
                  <div>
                    <Heading as="h2" size="5" className="font-semibold text-gray-900 mt-2">
                      {t(`my_job.status.${user.employee.status.toLowerCase()}`)}
                    </Heading>
                    <Text as="p" mt="2">
                      {t(`my_job.status_description.${user.employee.status.toLowerCase()}`)}
                    </Text>
                  </div>
                  {user.employee.status === EmployeeStatusEnum.Pending && (
                    <Callout.Root color="orange">
                      <Callout.Icon>
                        <ExclamationTriangleIcon />
                      </Callout.Icon>
                      <Callout.Text>{t('my_job.warning_message')}</Callout.Text>
                    </Callout.Root>
                  )}
                  <Flex mt="6" direction="column" gap="3">
                    <Flex className="text-left" direction="column" gap="1">
                      <Text weight="bold" size="3" color="gray">
                        {t('establishment')}
                      </Text>
                      <Link to={`/establishments/${getUriId(user.employee.establishment.id)}`}>
                        {user.employee.establishment.name}
                      </Link>
                    </Flex>
                    {user.employee.motivation && (
                      <Flex className="text-left" direction="column" gap="1">
                        <Text weight="bold" size="3" color="gray">
                          {t('employee.motivation')}
                        </Text>
                        <Blockquote>{user.employee.motivation}</Blockquote>
                      </Flex>
                    )}
                    <div className="mt-6 text-center">
                      <Form
                        id="employee-delete-form"
                        action="delete"
                        method="post"
                        className="hidden"
                        unstable_viewTransition
                      />
                      <FormAlertDialog
                        title={t('delete')}
                        description={
                          user.employee.status === EmployeeStatusEnum.Active
                            ? t('my_job.delete.confirm')
                            : t('my_job.delete.confirm_stop_application')
                        }
                        formId="employee-delete-form"
                      >
                        <Button type="button" color="red" className="w-fit">
                          {t('delete')}
                        </Button>
                      </FormAlertDialog>
                    </div>
                  </Flex>
                </>
              )}
            </Flex>
          </div>
        </Flex>
      </Container>
    </main>
  );
}
