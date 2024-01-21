import { Container } from '@radix-ui/themes';

import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ context }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  return null;
}

export default function Schedule() {
  const HOURS = [
    '0:00',
    '1:00',
    '2:00',
    '3:00',
    '4:00',
    '5:00',
    '6:00',
    '7:00',
    '8:00',
    '9:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ];

  const days = [
    {
      name: 'Monday',
      employees: [
        {
          name: 'John Doe',
          hours: [
            {
              start: '8:00',
              end: '12:00',
            },
            {
              start: '13:00',
              end: '17:00',
            },
          ],
        },
        {
          name: 'Jane Doe',
          hours: [
            {
              start: '8:00',
              end: '12:30',
            },
            {
              start: '13:30',
              end: '18:00',
            },
          ],
        },
      ],
    },
    { name: 'Tuesday' },
    { name: 'Wednesday' },
    { name: 'Thursday' },
    { name: 'Friday' },
    { name: 'Saturday' },
    { name: 'Sunday' },
  ];

  return (
    <main className="py-10">
      <Container>
        <ul className="relative overflow-clip rounded-6 border-2 border-accent-8">
          {/* Rows */}
          {HOURS.map((time) => (
            <li
              key={time}
              className="flex h-11 items-center px-2.5 odd:bg-accent-3 even:bg-accent-6"
            >
              {time}
            </li>
          ))}
          <div className="absolute inset-0 grid grid-cols-7 rem:pl-[60px]">
            {/* Columns */}
            {days.map(({ employees, name }) => (
              <div
                className="grid border-accent-8 first:border-l-2 has-[+*]:border-r-2"
                key={name}
                style={{ gridTemplateColumns: `repeat(${employees?.length}, 1fr` }}
              >
                {/* Sub columns */}
                {employees?.map(({ hours, name }) => (
                  <div className="grid grid-rows-[repeat(calc(24*60),1fr)]" key={name}>
                    {/* Employee hours */}
                    {hours.map(({ end, start }, i) => (
                      <div className="grid grid-rows-subgrid bg-red-5" key={i}></div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ul>
      </Container>
    </main>
  );
}
