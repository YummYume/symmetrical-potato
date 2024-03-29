import { Container, Grid, Heading, Section } from '@radix-ui/themes';
import { useLoaderData } from '@remix-run/react';
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { i18next } from '~/lib/i18n/index.server';
import { getHeistStatistics } from '~api/heist';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ request, context }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  const t = await i18next.getFixedT(request, 'admin');
  const heistsStatistics = await getHeistStatistics(context.client);

  return {
    heistsStatistics,
    meta: {
      title: t('meta.home.title', {
        ns: 'admin',
      }),
      description: t('meta.home.description', {
        ns: 'admin',
      }),
    },
  };
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

const Widget = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Grid gap="6" align="center" className="rounded-4 border-2 px-10 py-4 shadow-4">
    <Heading as="h2">{title}</Heading>

    {children}
  </Grid>
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

      <Section>
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
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
      </Section>
    </main>
  );
}
