import * as Tooltip from '@radix-ui/react-tooltip';
import { Card } from '@radix-ui/themes';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeContext } from '~lib/context/Theme';

import { Link } from './Link';

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

const nameToColor = (string: string) => {
  let total = 0;

  // Sum up the ASCII values of each character in the string
  for (let i = 0; i < string.length; i++) {
    total += string.charCodeAt(i);
  }

  const color = `${(((total % 360) + 360) % 360) + 1}`;

  return `oklch(66.6% 0.15 ${color} / 0.75)`;
};

const hoursToMinutes = (hour: string) => {
  const parts = hour.split(':');

  if (parts.length !== 2) {
    return hour;
  }

  return `${parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)}`;
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
                '--color': nameToColor(name),
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
                        {hour.reason === 'heist' && (
                          <Tooltip.Trigger asChild>
                            <Link
                              to={`/map/${hour.heist.location}/heist/${hour.heist.id}`}
                              aria-label={hour.heist.name}
                              unstyled
                              className="-mx-px grid grid-rows-subgrid border-2 border-accent-12 bg-[var(--color)]"
                              style={{
                                gridRowEnd: hoursToMinutes(hour.endAt),
                                gridRowStart: hoursToMinutes(hour.startAt),
                              }}
                            ></Link>
                          </Tooltip.Trigger>
                        )}
                        {hour.reason === 'time_off' && (
                          <Tooltip.Trigger asChild>
                            <button
                              aria-label={t('more_info')}
                              className="-mx-px grid grid-rows-subgrid border-2 border-accent-12 bg-[var(--color)]"
                              style={{
                                gridRowEnd: hoursToMinutes(hour.endAt),
                                gridRowStart: hoursToMinutes(hour.startAt),
                              }}
                            ></button>
                          </Tooltip.Trigger>
                        )}
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
