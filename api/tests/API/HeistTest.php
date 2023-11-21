<?php

namespace App\Tests\API;

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
     * @description This method is used to test if a user getting access only to the heists he has access to
     */
    public function checkHeistsHas(array $result, string $username = null): void
    {
        static::checkRessourceHas('heists {
            edges {
                node {
                    name
                }
            }
        }', ['heists' => ['edges' => $result]], $username);
    }

    /**
     * @description This method is used to test if a user not authenticated can get all the public heists only
     */
    public function testGetHeistsNotAuthenticated(): void
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
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

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertEquals(403, $data['errors'][0]['extensions']['status'] ?? null);
    }

    /**
     * @description This method is used to test if an admin can get all the heists
     */
    public function testGetHeistsHasAdmin(): void
    {
        $this->checkHeistsHas(self::ALL_HEIST, self::ADMIN);
    }

    /**
     * @description This method is used to test if a contractor can get all the heists
     */
    public function testGetHeistsHasContrator(): void
    {
        $this->checkHeistsHas(self::ALL_HEIST, self::CONTRACTOR);
    }

    /**
     * @description This method is used to test if an employee can get all the public heists
     */
    public function testGetHeistsHasEmployee(): void
    {
        $this->checkHeistsHas(self::ALL_PUBLIC_HEIST, self::EMPLOYEE);
    }

    /**
     * @description This method is used to test if a heister can get all the public heists
     */
    public function testGetHeistsHasHeister(): void
    {
        $this->checkHeistsHas(self::ALL_PUBLIC_HEIST);
    }

    /**
     * @description This method is used to test if a contractor can get all the heists he has made
     */
    public function testGetHeistsMadeByAContractor(): void
    {
        ['client' => $client, 'userId' => $userId] = static::createAuthenticatedClient(self::CONTRACTOR);
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

    /**
     * @description This method is used to test if a employee can get all the heists he is related to
     */
    public function testGetHeistsRelatedToAnEmployee(): void
    {
        ['client' => $client, 'userId' => $userId] = static::createAuthenticatedClient(self::EMPLOYEE);
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

    /**
     * @description This method is used to test if a heister can get all the heists he is member of
     */
    public function testGetHeistsLinkedToAHeister(): void
    {
        ['client' => $client, 'userId' => $userId] = static::createAuthenticatedClient();
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

    /**
     * @description This method is used to test if a employee can get all the finished heists he is related to
     */
    public function testGetFinishedHeistsEmployee(): void
    {
        ['client' => $client, 'userId' => $userId] = static::createAuthenticatedClient(self::EMPLOYEE);
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('query {
                    heists(employee__user__id: "%s", phase: "%s") {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                }', $userId, 'succeeded|failed|cancelled'),
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
