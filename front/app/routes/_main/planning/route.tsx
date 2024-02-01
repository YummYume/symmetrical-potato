import { Container } from '@radix-ui/themes';

import Schedule from '~/lib/components/Schedule';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { LoaderFunctionArgs } from '@remix-run/node';
import type { Day } from '~/lib/components/Schedule';

export async function loader({ context }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  return null;
}

export default function Planning() {
  const days: Day[] = [
    {
      name: 'Monday',
      employees: [
        {
          name: 'Michael Smith',
          hours: [
            { start: '9:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
        },
        {
          name: 'Emily Johnson',
          hours: [
            { start: '8:30', end: '12:30' },
            { start: '13:30', end: '16:30' },
          ],
        },
        {
          name: 'David Williams',
          hours: [
            { start: '10:00', end: '12:30' },
            { start: '13:30', end: '18:00' },
          ],
        },
      ],
    },
    {
      name: 'Tuesday',
      employees: [
        {
          name: 'Michael Smith',
          hours: [
            { start: '9:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
        },
        {
          name: 'Emily Johnson',
          hours: [
            { start: '8:00', end: '12:00' },
            { start: '13:00', end: '16:00' },
          ],
        },
        {
          name: 'Sophia Brown',
          hours: [
            { start: '10:30', end: '12:30' },
            { start: '13:30', end: '18:30' },
          ],
        },
      ],
    },
    {
      name: 'Wednesday',
      employees: [
        {
          name: 'Michael Smith',
          hours: [
            { start: '9:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
        },
        {
          name: 'Emily Johnson',
          hours: [
            { start: '8:30', end: '12:30' },
            { start: '13:30', end: '16:30' },
          ],
        },
        {
          name: 'James Wilson',
          hours: [
            { start: '10:00', end: '12:30' },
            { start: '13:30', end: '18:00' },
          ],
        },
      ],
    },
    {
      name: 'Thursday',
      employees: [
        {
          name: 'Michael Smith',
          hours: [
            { start: '9:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
        },
        {
          name: 'Emily Johnson',
          hours: [
            { start: '8:00', end: '12:00' },
            { start: '13:00', end: '16:00' },
          ],
        },
        {
          name: 'Olivia Taylor',
          hours: [
            { start: '10:30', end: '12:30' },
            { start: '13:30', end: '18:30' },
          ],
        },
      ],
    },
    {
      name: 'Friday',
      employees: [
        {
          name: 'Michael Smith',
          hours: [
            { start: '9:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
        },
        {
          name: 'Emily Johnson',
          hours: [
            { start: '8:30', end: '12:30' },
            { start: '13:30', end: '16:30' },
          ],
        },
        {
          name: 'Daniel Martinez',
          hours: [
            { start: '10:00', end: '12:30' },
            { start: '13:30', end: '18:00' },
          ],
        },
      ],
    },
    {
      name: 'Saturday',
      employees: [
        {
          name: 'Sophia Brown',
          hours: [
            { start: '9:00', end: '14:00' },
            { start: '14:30', end: '18:00' },
          ],
        },
        {
          name: 'James Wilson',
          hours: [
            { start: '8:30', end: '13:30' },
            { start: '14:00', end: '17:30' },
          ],
        },
      ],
    },
    {
      name: 'Sunday',
      employees: [
        {
          name: 'Olivia Taylor',
          hours: [
            { start: '10:00', end: '15:00' },
            { start: '15:30', end: '18:00' },
          ],
        },
        {
          name: 'Daniel Martinez',
          hours: [
            { start: '11:00', end: '16:00' },
            { start: '16:30', end: '19:30' },
          ],
        },
      ],
    },
  ];

  return (
    <main className="py-10">
      <Container>
        <Schedule days={days} />
      </Container>
    </main>
  );
}
