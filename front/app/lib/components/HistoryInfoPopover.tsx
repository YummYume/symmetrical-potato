import { Popover, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import dayjs from '~utils/dayjs';

export type HistoryInfoPopoverProps = {
  createdAt: string | undefined | null;
  updatedAt: string | undefined | null;
  createdBy: string | undefined | null;
  updatedBy: string | undefined | null;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
} & React.ComponentProps<typeof Popover.Content>;

export const HistoryInfoPopover = ({
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  children,
  fallback,
  ...rest
}: HistoryInfoPopoverProps) => {
  const { t } = useTranslation();

  let content: string = '';

  if (createdBy && createdAt) {
    content += t('history_info.created_by_at', {
      name: createdBy,
      date: dayjs(createdAt).format('L'),
      time: dayjs(createdAt).format('LT'),
    });
  } else if (createdBy) {
    content += t('history_info.created_by', { name: createdBy });
  } else if (createdAt) {
    content += t('history_info.created_at', {
      date: dayjs(createdAt).format('L'),
      time: dayjs(createdAt).format('LT'),
    });
  }

  content += ' ';

  if (updatedBy && updatedAt) {
    content += t('history_info.updated_by_at', {
      name: updatedBy,
      date: dayjs(updatedAt).format('L'),
      time: dayjs(updatedAt).format('LT'),
    });
  } else if (updatedBy) {
    content += t('history_info.updated_by', { name: updatedBy });
  } else if (updatedAt) {
    content += t('history_info.updated_at', {
      date: dayjs(updatedAt).format('L'),
      time: dayjs(updatedAt).format('LT'),
    });
  }

  content = content.trim();

  return (
    <>
      {content !== '' && (
        <Popover.Root>
          <Popover.Trigger>{children}</Popover.Trigger>
          <Popover.Content className="max-w-64" align="center" side="top" {...rest}>
            <Text size="2" as="p">
              {content}
            </Text>
          </Popover.Content>
        </Popover.Root>
      )}
      {content === '' && fallback}
    </>
  );
};
