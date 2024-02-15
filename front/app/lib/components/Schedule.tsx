import * as Tooltip from '@radix-ui/react-tooltip';
import { Card } from '@radix-ui/themes';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeContext } from '~lib/context/Theme';

import { Link } from './Link';

import dayjs from '../utils/dayjs';

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
] as const;

export const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const randomColor = (string: string) => {
  let total = 0;

  // Sum up the ASCII values of each character in the string
  for (let i = 0; i < string.length; i++) {
    total += string.charCodeAt(i);
  }

  return `${(((total % 360) + 360) % 360) + 1}`;
};

export type DayHeistHour = {
  reason: 'heist';
  startAt: string;
  endAt: string;
  heist: {
    id: string;
    name: string;
    location: string;
  };
};

export type DayTimeOffHour = {
  reason: 'time_off';
  startAt: string;
  endAt: string;
  timeOff: {
    id: string;
    reason?: string;
  };
};

export type Day = {
  name: string;
  employees: {
    name: string;
    hours: (DayHeistHour | DayTimeOffHour)[];
  }[];
};

export default function Schedule({ days }: Readonly<{ days: Day[] }>) {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <ul className="relative overflow-clip rounded-6 border-2 border-accent-8">
      {/* Rows */}
      {HOURS.map((time) => (
        <li key={time} className="flex h-11 items-center px-2.5 odd:bg-accent-3 even:bg-accent-6">
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
            {employees?.map(({ hours, name }, index) => {
              const customStyle: {
                [key: string]: string;
              } = {
                '--color': randomColor(name),
              };

              return (
                <div
                  className="grid grid-rows-[repeat(calc(24*60),1fr)]"
                  key={`${name}-${index}`}
                  style={customStyle}
                >
                  {/* Employee hours */}
                  {hours.map((hour, i) => (
                    <Tooltip.Provider key={i}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          {hour.reason === 'heist' && (
                            <Link
                              to={`/map/${hour.heist.location}/heist/${hour.heist.id}`}
                              aria-label={hour.heist.name}
                              unstyled
                              className="-mx-px grid grid-rows-subgrid border-2 border-accent-12 bg-[var(--color)]"
                              style={{
                                gridRowEnd: dayjs(hour.endAt).format('HH:mm'),
                                gridRowStart: dayjs(hour.startAt).format('HH:mm'),
                              }}
                            ></Link>
                          )}
                          {hour.reason === 'time_off' && (
                            <button
                              aria-label={t('more_info')}
                              className="-mx-px grid grid-rows-subgrid border-2 border-accent-12 bg-[var(--color)]"
                              style={{
                                gridRowEnd: dayjs(hour.endAt).format('HH:mm'),
                                gridRowStart: dayjs(hour.startAt).format('HH:mm'),
                              }}
                            ></button>
                          )}
                        </Tooltip.Trigger>
                        <Tooltip.Portal container={theme?.current}>
                          <Tooltip.Content sideOffset={5}>
                            <Card>
                              <p>{name}</p>
                              <p>
                                {hour.startAt} - {hour.endAt}
                              </p>
                            </Card>
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </ul>
  );
}
