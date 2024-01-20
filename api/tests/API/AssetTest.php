<?php

namespace App\Tests\API;

use App\DataFixtures\AssetFixtures;
use App\DataFixtures\HeistFixtures;
use App\DataFixtures\UserFixtures;
use App\Entity\Asset;
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

    /**
     * Tests if a contractor cannot create an asset for a heist they do not own.
     */
    public function testContractorCannotCreateAssetForOtherHeist(): void
    {
        $id = $this->findIriBy(Heist::class, [
            'name' => HeistFixtures::DATA[HeistFixtures::HEIST_99_BOXES_PLANNING]['name'],
            'phase' => HeistFixtures::DATA[HeistFixtures::HEIST_99_BOXES_PLANNING]['phase'],
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

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['asset'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a contractor cannot create an asset for a heist that is not in the planning phase.
     */
    public function testContractorCannotCreateAssetForNonPlanningHeist(): void
    {
        $id = $this->findIriBy(Heist::class, [
            'name' => HeistFixtures::DATA[HeistFixtures::HEIST_NO_REST_FOR_THE_WICKED_SUCCESS]['name'],
            'phase' => HeistFixtures::DATA[HeistFixtures::HEIST_NO_REST_FOR_THE_WICKED_SUCCESS]['phase'],
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

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['asset'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a contractor cannot create a global asset.
     */
    public function testContractorCannotCreateGlobalAsset(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('shade');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createAsset(input: {
                        name: "Test global asset"
                        price: 50
                        type: Asset
                        maxQuantity: 2
                        teamAsset: false
                    }) {
                        asset {
                            name
                            price
                            type
                            maxQuantity
                            teamAsset
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
     * Tests if an admin can create a global asset.
     */
    public function testAdminCanCreateGlobalAsset(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('bain');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createAsset(input: {
                        name: "Test global asset"
                        price: 50
                        type: Asset
                        maxQuantity: 2
                        teamAsset: false
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
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'createAsset' => [
                    'asset' => [
                        'name' => 'Test global asset',
                        'price' => 50,
                        'type' => 'Asset',
                        'maxQuantity' => 2,
                        'teamAsset' => false,
                        'heist' => null,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if an asset cannot have an already existing name.
     */
    public function testAssetCannotHaveAlreadyExistingName(): void
    {
        $name = AssetFixtures::DATA[AssetFixtures::GLOBAL_ASSET_AMMO_BAG]['name'];

        ['client' => $client] = static::createAuthenticatedClient('bain');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createAsset(input: {
                        name: "%s"
                        price: 50
                        type: Asset
                        maxQuantity: 2
                        teamAsset: false
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
                }', $name),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['asset'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if an asset can be updated.
     */
    public function testAssetCanBeUpdated(): void
    {
        $name = AssetFixtures::DATA[AssetFixtures::GLOBAL_ASSET_AMMO_BAG]['name'];
        $id = $this->findIriBy(Asset::class, ['name' => $name, 'heist' => null]);

        ['client' => $client] = static::createAuthenticatedClient('bain');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateAsset(input: {
                        id: "%s"
                        price: 100
                    }) {
                        asset {
                            price
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'updateAsset' => [
                    'asset' => [
                        'price' => 100,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if an asset can be deleted.
     */
    public function testAssetCanBeDeleted(): void
    {
        $name = AssetFixtures::DATA[AssetFixtures::GLOBAL_ASSET_AMMO_BAG]['name'];
        $id = $this->findIriBy(Asset::class, ['name' => $name, 'heist' => null]);

        ['client' => $client] = static::createAuthenticatedClient('bain');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    deleteAsset(input: {id: "%s"}) {
                        asset {
                            id
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'deleteAsset' => [
                    'asset' => [
                        'id' => $id,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if crew members get their money back when an asset is deleted.
     */
    public function testCrewMembersGetTheirMoneyBackFromDeleteAsset(): void
    {
        $name = AssetFixtures::DATA[AssetFixtures::GLOBAL_ASSET_MEDIC_BAG]['name'];
        $id = $this->findIriBy(Asset::class, ['name' => $name, 'heist' => null]);

        ['client' => $client] = static::createAuthenticatedClient('bain');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    deleteAsset(input: {id: "%s"}) {
                        asset {
                            id
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'deleteAsset' => [
                    'asset' => [
                        'id' => $id,
                    ],
                ],
            ],
        ]);

        $dallasId = $this->findIriBy(User::class, ['username' => UserFixtures::HEISTER_DALLAS]);
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('query {
                    user(id: "%s") {
                        id
                        username
                        balance
                    }
                }', $dallasId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'user' => [
                    'id' => $dallasId,
                    'username' => UserFixtures::HEISTER_DALLAS,
                    'balance' => UserFixtures::DATA[UserFixtures::HEISTER_DALLAS]['balance'] + AssetFixtures::DATA[AssetFixtures::GLOBAL_ASSET_MEDIC_BAG]['price'],
                ],
            ],
        ]);
    }
}
