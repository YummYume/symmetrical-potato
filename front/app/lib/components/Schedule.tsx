import * as Tooltip from '@radix-ui/react-tooltip';
import { Card } from '@radix-ui/themes';
import { useContext } from 'react';

import { ThemeContext } from '~lib/context/Theme';

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

const randomColor = () => {
  const randomNumber = Math.floor(Math.random() * 360) + 1;

  return `oklch(66.6% 0.15 ${randomNumber} / 0.75)`;
};

const stringToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':');

  return +hours * 60 + +minutes;
};

export type Day = {
  name: string;
  employees: {
    name: string;
    hours: {
      start: string;
      end: string;
    }[];
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
            {employees?.map(({ hours, name }) => {
              const customStyle: {
                [key: string]: string;
              } = {
                '--color': randomColor(),
              };

              return (
                <div
                  className="grid grid-rows-[repeat(calc(24*60),1fr)]"
                  key={name}
                  style={customStyle}
                >
                  {/* Employee hours */}
                  {hours.map(({ end, start }, i) => (
                    <Tooltip.Provider key={i}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            aria-label={t('more-info')}
                            className="-mx-px grid grid-rows-subgrid border-2 border-accent-12 bg-[var(--color)]"
                            style={{
                              gridRowEnd: stringToMinutes(end),
                              gridRowStart: stringToMinutes(start),
                            }}
                          ></button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal container={theme?.current}>
                          <Tooltip.Content sideOffset={5}>
                            <Card>
                              <p>{name}</p>
                              <p>
                                {start} - {end}
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
