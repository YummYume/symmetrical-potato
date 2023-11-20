<?php

namespace App\Tests\API;

use ApiPlatform\Symfony\Bundle\Test\Client;
use App\Tests\AbstractTestCase;

final class HeistTest extends AbstractTestCase
{
    public const ADMIN = 'bain';
    public const CONTRACTOR = 'shade';
    public const EMPLOYEE = 'bob';

    public const ALL_PUBLIC_HEIST = [
        ['node' => ['name' => 'No Rest for the Wicked']],
        ['node' => ['name' => 'No Rest for the Wicked']],
        ['node' => ['name' => 'Road Rage']],
        ['node' => ['name' => 'Road Rage']],
        ['node' => ['name' => 'Dirty Ice']],
        ['node' => ['name' => 'Dirty Ice']],
        ['node' => ['name' => 'Rock the Cradle']],
        ['node' => ['name' => 'Rock the Cradle']],
        ['node' => ['name' => 'Under the Surphaze']],
        ['node' => ['name' => 'Under the Surphaze']],
        ['node' => ['name' => 'Gold & Sharke']],
        ['node' => ['name' => 'Gold & Sharke']],
        ['node' => ['name' => '99 Boxes']],
        ['node' => ['name' => '99 Boxes']],
        ['node' => ['name' => 'Touch the Sky']],
        ['node' => ['name' => 'Touch the Sky']],
    ];

    public const ALL_HEIST = [
        ['node' => ['name' => 'No Rest for the Wicked']],
        ['node' => ['name' => 'No Rest for the Wicked']],
        ['node' => ['name' => 'No Rest for the Wicked']],
        ['node' => ['name' => 'Road Rage']],
        ['node' => ['name' => 'Road Rage']],
        ['node' => ['name' => 'Road Rage']],
        ['node' => ['name' => 'Dirty Ice']],
        ['node' => ['name' => 'Dirty Ice']],
        ['node' => ['name' => 'Dirty Ice']],
        ['node' => ['name' => 'Rock the Cradle']],
        ['node' => ['name' => 'Rock the Cradle']],
        ['node' => ['name' => 'Rock the Cradle']],
        ['node' => ['name' => 'Under the Surphaze']],
        ['node' => ['name' => 'Under the Surphaze']],
        ['node' => ['name' => 'Under the Surphaze']],
        ['node' => ['name' => 'Gold & Sharke']],
        ['node' => ['name' => 'Gold & Sharke']],
        ['node' => ['name' => 'Gold & Sharke']],
        ['node' => ['name' => '99 Boxes']],
        ['node' => ['name' => '99 Boxes']],
        ['node' => ['name' => '99 Boxes']],
        ['node' => ['name' => 'Touch the Sky']],
        ['node' => ['name' => 'Touch the Sky']],
        ['node' => ['name' => 'Touch the Sky']],
    ];

    /**
     * @param array<int, mixed> $result
     *
     * @description This method is used to test the GraphQL queries with different user.
     */
    public function getHeistsHas(array $result, string $username = null): void
    {
        static::getHas('heists {
            edges {
                node {
                    name
                }
            }
        }', ['heists' => ['edges' => $result]], $username);
    }

    public function testGetHeistsNotAuthenticated(): void
    {
        static::createClient()->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'query {
                    heists {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonEquals([
            'data' => [
                'heists' => [
                    'edges' => self::ALL_PUBLIC_HEIST,
                ],
            ],
        ]);
    }

    public function testGetHeistsHasAdmin(): void
    {
        $this->getHeistsHas(self::ALL_HEIST, self::ADMIN);
    }

    public function testGetHeistsHasContrator(): void
    {
        $this->getHeistsHas(self::ALL_HEIST, self::CONTRACTOR);
    }

    public function testGetHeistsHasEmployee(): void
    {
        $this->getHeistsHas(self::ALL_PUBLIC_HEIST, self::EMPLOYEE);
    }

    public function testGetHeistsHasHeister(): void
    {
        $this->getHeistsHas(self::ALL_PUBLIC_HEIST);
    }

    public function testGetHeistsFromAContractor(): void
    {
        /**
         * @var Client      $client
         * @var string|null $userId
         */
        [$client, $userId] = static::createAuthenticatedClient(self::CONTRACTOR);
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('query {
                    heists(establishment__contractor__id: "%s") {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                }', $userId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonEquals([
            'data' => [
                'heists' => [
                    'edges' => [
                        ['node' => ['name' => 'No Rest for the Wicked']],
                        ['node' => ['name' => 'No Rest for the Wicked']],
                        ['node' => ['name' => 'No Rest for the Wicked']],
                        ['node' => ['name' => 'Gold & Sharke']],
                        ['node' => ['name' => 'Gold & Sharke']],
                        ['node' => ['name' => 'Gold & Sharke']],
                    ],
                ],
            ],
        ]);
    }

    public function testGetHeistsLinkedToAEmployee(): void
    {
        /**
         * @var Client      $client
         * @var string|null $userId
         */
        [$client, $userId] = static::createAuthenticatedClient(self::EMPLOYEE);
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('query {
                    heists(employee__user__id: "%s") {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                }', $userId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonEquals([
            'data' => [
                'heists' => [
                    'edges' => [
                        ['node' => ['name' => 'Road Rage']],
                        ['node' => ['name' => 'Road Rage']],
                    ],
                ],
            ],
        ]);
    }

    public function testGetHeistsLinkedToAHeister(): void
    {
        /**
         * @var Client      $client
         * @var string|null $userId
         */
        [$client, $userId] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('query {
                    heists(crewMembers__user__id: "%s") {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                }', $userId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonEquals([
            'data' => [
                'heists' => [
                    'edges' => [
                        ['node' => ['name' => 'No Rest for the Wicked']],
                        ['node' => ['name' => 'Road Rage']],
                        ['node' => ['name' => 'Dirty Ice']],
                        ['node' => ['name' => 'Gold & Sharke']],
                        ['node' => ['name' => 'Touch the Sky']],
                    ],
                ],
            ],
        ]);
    }

    public function testGetHeistsFinishedLinkedToAEmployee(): void
    {
        /**
         * @var Client      $client
         * @var string|null $userId
         */
        [$client, $userId] = static::createAuthenticatedClient(self::EMPLOYEE);
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('query {
                    heists(employee__user__id: "%s", isFinished: true) {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                }', $userId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonEquals([
            'data' => [
                'heists' => [
                    'edges' => [
                        ['node' => ['name' => 'Road Rage']],
                        ['node' => ['name' => 'Road Rage']],
                    ],
                ],
            ],
        ]);
    }
}
