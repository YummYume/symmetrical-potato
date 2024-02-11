import { Pencil2Icon } from '@radix-ui/react-icons';
import { Container, Table } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Link } from '~/lib/components/Link';
import { Rating } from '~/lib/components/Rating';

export default function Establishment() {
  const { t } = useTranslation();

  return (
    <main className="py-10">
      <Container className="space-y-16">
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>{t('establishment.name')}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{t('user.role.contractor')}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{t('establishment.description')}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="whitespace-nowrap">
                {t('establishment.minimum_wage')}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="whitespace-nowrap">
                {t('establishment.minimum_work_time_per_week')}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="whitespace-nowrap">
                {t('establishment.contractor_cut')}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="whitespace-nowrap">
                {t('establishment.employee_cut')}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="whitespace-nowrap">
                {t('establishment.crew_cut')}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="whitespace-nowrap">
                {t('establishment.average_rating')}
              </Table.ColumnHeaderCell>
              {/* TODO : Only owner */}
              <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: 5 }).map((_, index) => (
              <Table.Row key={index}>
                <Table.RowHeaderCell className="whitespace-nowrap">John Doe</Table.RowHeaderCell>
                <Table.Cell>John Doe</Table.Cell>
                <Table.Cell>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur totam quidem
                  magni, reprehenderit, odit, dicta rerum quis facilis quisquam dolor ab vitae. Quos
                  repudiandae ipsam necessitatibus amet quae excepturi atque.
                </Table.Cell>
                <Table.Cell>XXX</Table.Cell>
                <Table.Cell>XXH</Table.Cell>
                <Table.Cell>X%</Table.Cell>
                <Table.Cell>X%</Table.Cell>
                <Table.Cell>X%</Table.Cell>
                <Table.Cell>
                  <Rating value={5} />
                </Table.Cell>
                {/* TODO : Only owner */}
                <Table.Cell>
                  <Link aria-label={t('edit')} to="establishment/edit">
                    <Pencil2Icon className="size-6" />
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Container>
    </main>
  );
}
