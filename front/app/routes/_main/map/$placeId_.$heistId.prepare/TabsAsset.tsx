import { Button, Grid, Tabs, Text } from '@radix-ui/themes';

import { CardAsset } from './CartAsset';

import type { Asset } from '~/lib/api/types';

type TabsAssetProps = {
  text: string;
  value: string;
  assets: Record<string, Asset>;
  addIcon: JSX.Element;
  removeIcon: JSX.Element;
  setGlobalQuantity: (assetId: string) => number;
  setQuantity: (assetId: string) => number;
  onAddAsset: (asset: Asset) => void;
  onRemoveAsset: (asset: Asset) => void;
};
export function TabsAsset({
  text,
  value,
  assets,
  addIcon,
  removeIcon,
  setGlobalQuantity,
  setQuantity,
  onAddAsset,
  onRemoveAsset,
}: TabsAssetProps) {
  return (
    <Tabs.Content value={value}>
      <Text size="3" className="italic">
        {text}
      </Text>
      <>
        {Object.keys(assets).map((type, index) => (
          <Grid
            key={`${value}-${assets[type].id}-${index}`}
            className="mt-2"
            columns="1fr auto auto auto"
            gap="3"
            align="center"
          >
            <CardAsset asset={assets[type]} quantity={setGlobalQuantity(assets[type].id)} />
            {setGlobalQuantity(assets[type].id) < assets[type].maxQuantity && (
              <Button type="button" onClick={() => onAddAsset(assets[type])}>
                {addIcon}
              </Button>
            )}
            {setQuantity(assets[type].id) > 0 && (
              <Button type="button" onClick={() => onRemoveAsset(assets[type])}>
                {removeIcon}
              </Button>
            )}
          </Grid>
        ))}
      </>
    </Tabs.Content>
  );
}
