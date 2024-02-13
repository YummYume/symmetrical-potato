import { useTranslation } from 'react-i18next';

import { DAYS, type Schedule } from '~/lib/utils/days';

export type EmployeeScheduleListProps = {
  schedule: Schedule;
} & React.ComponentProps<'div'>;

export const EmployeeScheduleList = ({ schedule, ...rest }: EmployeeScheduleListProps) => {
  const { t } = useTranslation();

  return (
    <div className="flow-root" {...rest}>
      <ul className="-mb-8">
        {Object.entries(schedule).map(([day, hours]) => {
          return (
            <li key={day}>
              <div className="relative pb-8">
                {day !== DAYS.SUNDAY && (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-8"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-10">
                  <div className="relative" aria-hidden="true">
                    <div className="absolute left-2.5 h-5 w-5 rounded-6 bg-accent-8" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-3">
                        <p className="font-medium text-gray-11">{t(`day.${day}`)}</p>
                      </div>
                    </div>
                    <div className="ml-0.5 mt-2 text-2 text-gray-10">
                      {hours.length === 0 && <span>{t('employee.schedule.free_day')}</span>}
                      {hours.map((hour, index) => {
                        return (
                          <div key={index}>
                            <span>
                              {hour.startAt} - {hour.endAt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
