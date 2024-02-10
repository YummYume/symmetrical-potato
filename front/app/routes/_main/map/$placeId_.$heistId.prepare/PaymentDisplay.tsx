import { Table } from '@radix-ui/themes';

type PaymentDisplayProps = {
  title: string;
  assets: { quantity: number; name: string; price: number }[];
  rows: {
    name: string;
    price: string;
    quantity: string;
  };
};
export function PaymentDisplay({ title, assets, rows }: PaymentDisplayProps) {
  return (
    <Table.Root>
      <caption className="sr-only">{title}</caption>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>{rows.name}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{rows.price}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{rows.quantity}</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {assets.map((asset, index) => (
          <Table.Row key={index}>
            <Table.Cell>{asset.name}</Table.Cell>
            <Table.Cell>
              {new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: 'USD',
              }).format(asset.price)}
            </Table.Cell>
            <Table.Cell>{asset.quantity}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
