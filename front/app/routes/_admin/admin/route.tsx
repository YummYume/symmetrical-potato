import { Container, Flex, Heading } from '@radix-ui/themes';
import { useLoaderData } from '@remix-run/react';
import { Chart as ChartJS, Tooltip, ArcElement, Legend, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { getHeistStatistics } from '~api/heist';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ context }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  const heistsStatistics = await getHeistStatistics(context.client);

  return {
    heistsStatistics,
  };
}

export type Loader = typeof loader;

const Widget = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Flex
    gap="6"
    direction="column"
    align="center"
    className="mx-auto rounded-4 border-2 px-10 py-4 shadow-4"
    width="min-content"
  >
    <Heading as="h2">{title}</Heading>

    <div className="sm:h-96 sm:w-96">{children}</div>
  </Flex>
);

export default function Admin() {
  const { heistsStatistics } = useLoaderData<Loader>();
  const { t } = useTranslation();

  ChartJS.register(ArcElement, Legend, Title, Tooltip);

  return (
    <main className="py-10">
      <Heading align="center" as="h1" size="9">
        {t('home')}
      </Heading>

      <Container className="mt-10">
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
          <Widget title={t('dashboard.heists.last_90_days', { ns: 'admin' })}>
            <Doughnut
              data={{
                labels: [
                  t('dashboard.heists.successful', { ns: 'admin' }),
                  t('dashboard.heists.failed', { ns: 'admin' }),
                  t('dashboard.heists.cancelled', { ns: 'admin' }),
                ],
                datasets: [
                  {
                    data: [
                      heistsStatistics.successfulHeists,
                      heistsStatistics.failedHeists,
                      heistsStatistics.cancelledHeists,
                    ],
                    backgroundColor: ['#2196F3', '#F44336', '#FF9800'],
                    hoverBackgroundColor: ['#2196F3', '#F44336', '#FF9800'],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    align: 'center',
                  },
                  title: {
                    display: true,
                    fullSize: false,
                    text: t('dashboard.heists.total', {
                      ns: 'admin',
                      total: heistsStatistics.totalHeists,
                    }),
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return t('dashboard.heists', {
                          ns: 'admin',
                          heists: context.dataset.data[context.dataIndex],
                        });
                      },
                    },
                    boxPadding: 5,
                  },
                },
              }}
              fallbackContent={t('dashboard.heists.summary', {
                ns: 'admin',
                successful: heistsStatistics.successfulHeists,
                failed: heistsStatistics.failedHeists,
                cancelled: heistsStatistics.cancelledHeists,
                total: heistsStatistics.totalHeists,
              })}
            />
          </Widget>

          <Widget title={t('dashboard.crew_members.last_90_days', { ns: 'admin' })}>
            <Doughnut
              data={{
                labels: [
                  t('dashboard.crew_members.free', { ns: 'admin' }),
                  t('dashboard.crew_members.jailed', { ns: 'admin' }),
                  t('dashboard.crew_members.dead', { ns: 'admin' }),
                ],
                datasets: [
                  {
                    data: [
                      heistsStatistics.freeHeisters,
                      heistsStatistics.jailedHeisters,
                      heistsStatistics.deadHeisters,
                    ],
                    backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
                    hoverBackgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    align: 'center',
                  },
                  title: {
                    display: true,
                    fullSize: false,
                    text: t('dashboard.crew_members.total', {
                      ns: 'admin',
                      total: heistsStatistics.totalHeisters,
                    }),
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return t('dashboard.crew_members', {
                          ns: 'admin',
                          crew_members: context.dataset.data[context.dataIndex],
                        });
                      },
                    },
                    boxPadding: 5,
                  },
                },
              }}
              fallbackContent={t('dashboard.crew_members.summary', {
                ns: 'admin',
                free: heistsStatistics.freeHeisters,
                jailed: heistsStatistics.jailedHeisters,
                dead: heistsStatistics.deadHeisters,
                total: heistsStatistics.totalHeisters,
              })}
            />
          </Widget>
        </div>
      </Container>
    </main>
  );
}
