<?php

namespace App\Tests\API;

use App\DataFixtures\HeistFixtures;
use App\Entity\Heist;
use App\Entity\User;
use App\Tests\AbstractTestCase;

final class AssetTest extends AbstractTestCase
{
    /**
     * Tests if a regular user cannot create an asset.
     */
    public function testUserCannotCreateAsset(): void
    {
        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createAsset(input: {
                        name: "Test asset"
                        price: 50
                        type: Asset
                        maxQuantity: 2
                        teamAsset: false
                    }) {
                        asset {
                            name
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['asset'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a contractor can create an asset for a heist they own.
     */
    public function testContractorCanCreateAssetForHeist(): void
    {
        $id = $this->findIriBy(Heist::class, [
            'name' => HeistFixtures::DATA[HeistFixtures::HEIST_NO_REST_FOR_THE_WICKED_PLANNING]['name'],
            'phase' => HeistFixtures::DATA[HeistFixtures::HEIST_NO_REST_FOR_THE_WICKED_PLANNING]['phase'],
        ]);

        ['client' => $client] = static::createAuthenticatedClient('shade');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createAsset(input: {
                        name: "Test asset"
                        price: 50
                        type: Asset
                        maxQuantity: 2
                        teamAsset: false
                        heist: "%s"
                    }) {
                        asset {
                            name
                            price
                            type
                            maxQuantity
                            teamAsset
                            heist {
                                name
                            }
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'createAsset' => [
                    'asset' => [
                        'name' => 'Test asset',
                        'price' => 50,
                        'type' => 'Asset',
                        'maxQuantity' => 2,
                        'teamAsset' => false,
                        'heist' => [
                            'name' => HeistFixtures::DATA[HeistFixtures::HEIST_NO_REST_FOR_THE_WICKED_PLANNING]['name'],
                        ],
                    ],
                ],
            ],
        ]);
    }
}
