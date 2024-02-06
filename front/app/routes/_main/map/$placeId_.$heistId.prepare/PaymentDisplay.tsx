import { Table } from '@radix-ui/themes';

type PaymentDisplayProps = {
  assets: { quantity: number; name: string; price: number }[];
  rows: {
    name: string;
    price: string;
    quantity: string;
  };
};
export function PaymentDisplay({ assets, rows }: PaymentDisplayProps) {
  return (
    <Table.Root>
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
            <Table.Cell>{asset.price}</Table.Cell>
            <Table.Cell>{asset.quantity}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
