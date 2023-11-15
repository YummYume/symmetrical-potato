import { Box, Container } from '@radix-ui/themes';
import { type MetaFunction } from '@remix-run/node';


export const meta: MetaFunction = () => {
  return [
    { title: 'Symmetrical Potato' },
    { name: 'description', content: 'The best looking potatoes, ever.' },
  ];
};

export let handle = {
  i18n: ['common'],
};

export default function Index() {
  return (
    <Container>
      <Box py="9">
        TEST
      </Box>
    </Container>
  );
}
