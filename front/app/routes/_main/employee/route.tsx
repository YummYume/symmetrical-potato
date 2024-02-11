import { Pencil2Icon } from '@radix-ui/react-icons';
import { Container, Table } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Link } from '~/lib/components/Link';

export default function Employees() {
  const { t } = useTranslation();

  return (
    <main className="py-10">
      <Container className="space-y-16">
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell className="whitespace-nowrap">
                {t('employee.code_name')}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{t('user.status')}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{t('employee.motivation')}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{t('description')}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: 5 }).map((_, index) => (
              <Table.Row key={index}>
                <Table.RowHeaderCell className="whitespace-nowrap">John Doe</Table.RowHeaderCell>
                <Table.Cell>Alive</Table.Cell>
                <Table.Cell>
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere, ad.
                </Table.Cell>
                <Table.Cell>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur totam quidem
                  magni, reprehenderit, odit, dicta rerum quis facilis quisquam dolor ab vitae. Quos
                  repudiandae ipsam necessitatibus amet quae excepturi atque.
                </Table.Cell>
                <Table.Cell>
                  <Link aria-label={t('edit')} to="employee/edit">
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
