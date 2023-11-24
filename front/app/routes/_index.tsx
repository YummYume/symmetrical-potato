import { Card, Container, Grid, Heading, Inset, Section, Text } from '@radix-ui/themes';
import { type MetaFunction } from '@remix-run/node';
import { Trans, useTranslation } from 'react-i18next';

import { Link } from '~components/Link';

const POTATOES = ['long', 'red', 'round', 'sweet', 'white', 'yellow'];

export const meta: MetaFunction = () => {
  return [
    { title: 'Symmetrical Potato' },
    { name: 'description', content: 'The best looking potatoes, ever.' },
  ];
};

export let handle = {
  i18n: ['common', 'visitor'],
};

export default function Index() {
  const { t } = useTranslation();

  return (
    <>
      <div className="relative hidden items-center overflow-hidden rem:h-[441px] lg:flex">
        <img
          src="img/potatoes.jpg"
          alt=""
          height={1067}
          width={1600}
          decoding="async"
          loading="lazy"
          className="absolute w-full"
        />
      </div>
      <Container p="4">
        <Section className="space-y-16">
          <Heading size="9" className="text-center capitalize">
            symmetrical potato
          </Heading>
          <Text as="p">
            <Trans i18nKey="potatoes.description" ns="visitor"></Trans>
          </Text>
          <Grid gap="4">
            <Heading as="h2" size="8" className="text-center first-letter:uppercase">
              {t('potatoes', {
                ns: 'visitor',
              })}
            </Heading>
            <Grid gap="6">
              {POTATOES.map((potato) => (
                <Grid gap="2" key={potato}>
                  <Heading as="h3" className="first-letter:uppercase">
                    {t(`potatoes.${potato}`, { ns: 'visitor' })}
                  </Heading>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {[...Array(5).keys()].map((i) => (
                      <Link key={i} to="/" className="group">
                        <Card>
                          <Inset>
                            <img
                              src={`/img/potatoes/${potato}.jpg`}
                              alt={`${potato}-${i}`}
                              decoding="async"
                              loading="lazy"
                              className="aspect-video object-cover transition-transform duration-500 ease-out group-focus-within:scale-110 group-hover:scale-110"
                            />
                          </Inset>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Section>
        <Section>
          <Grid gap="4">
            <Heading as="h2" size="8" className="text-center first-letter:uppercase">
              {t('potatoes.inspiration_title', { ns: 'visitor' })}
            </Heading>
            <Text as="p">{t('potatoes.inspiration', { ns: 'visitor' })}</Text>
            <iframe
              src="https://www.youtube-nocookie.com/embed/QiqqC_fbP1c"
              title="Youtube video"
              className="aspect-video w-full"
            />
          </Grid>
        </Section>
      </Container>
    </>
  );
}
