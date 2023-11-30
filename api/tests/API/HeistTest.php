<?php

namespace App\Tests\API;

use App\Tests\AbstractTestCase;

final class HeistTest extends AbstractTestCase
{
    public const MUSEUM_NYC_LATITUDE = 40.742949784543825;
    public const MUSEUM_NYC_LONGITUDE = -74.17140255510886;

    public const HEISTER = 'dallas';
    public const ADMIN = 'bain';
    public const CONTRACTOR = 'shade';
    public const EMPLOYEE = 'bob';

    public const ALL_PUBLIC_HEISTS = [
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

    public const ALL_HEISTS = [
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

    public const CREATE_HEIST = [
        'name' => 'the central park heist',
        'description' => 'A riche man is going to the central park with his family. We need to steal his golden car in his apartment.',
        'minimumPayout' => 50000,
        'maximumPayout' => 10000000,
        'preferedTactic' => 'Stealth',
        'difficulty' => 'VeryHard',
        'visibility' => 'Draft',
        'objectives' => [
        ],
        'latitude' => 40.742949784543825,
        'longitude' => -74.17140255510886,
    ];

    /**
     * This method is used to test if a user can only see the heists he is allowed to.
     *
     * @param array<int, mixed> $result   The expected result
     * @param string|null       $username The username to use to authenticate the user
     */
    public function checkUserCanSeeHeists(array $result, string $username = null): void
    {
        static::checkResourceJsonEquals('heists {
            edges {
                node {
                    name
                }
            }
        }', ['heists' => ['edges' => $result]], $username);
    }

    /**
     * This method is used to test if a not authenticated user can get all the public heists only.
     */
    public function testNotAuthenticatedCanSeePublicHeists(): void
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
     * This method is used to test if an admin can see all the heists.
     */
    public function testAdminCanSeeAllHeists(): void
    {
        $this->checkUserCanSeeHeists(self::ALL_HEISTS, self::ADMIN);
    }

    /**
     * This method is used to test if a contractor can see all the heists.
     */
    public function testContractorCanSeeAllHeists(): void
    {
        $this->checkUserCanSeeHeists(self::ALL_HEISTS, self::CONTRACTOR);
    }

    /**
     * This method is used to test if an employee can only see the public heists.
     */
    public function testEmployeeCanSeePublicHeists(): void
    {
        $this->checkUserCanSeeHeists(self::ALL_PUBLIC_HEISTS, self::EMPLOYEE);
    }

    /**
     * This method is used to test if a heister can only see the public heists.
     */
    public function testHeisterCanSeePublicHeists(): void
    {
        $this->checkUserCanSeeHeists(self::ALL_PUBLIC_HEISTS, self::HEISTER);
    }

    /**
     * This method is used to test if a contractor can see all the heists he has made.
     */
    public function testContractorCanSeeAllHeistsHeMade(): void
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
     * This method is used to test if an employee can see all the heists they are related to.
     */
    public function testEmployeeCanSeeAllHeistsRelated(): void
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
     * This method is used to test if an heister can see all the heists they are member of.
     */
    public function testHeisterCanSeeAllHeistMemberOf(): void
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
     * This method is used to test if an employee can get all the finished heists they are related to.
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
                    heists(employee__user__id: "%s", phase: %s) {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                }', $userId, '["succeeded", "failed", "cancelled"]'),
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
     * This method is used to test to create a heist as a contractor.
     */
    public function testCreateHeist(): void
    {
        ['client' => $client, 'userId' => $userId] = static::createAuthenticatedClient(self::CONTRACTOR);

        $now = new \DateTimeImmutable();

        $startAt = $now->format(\DateTimeInterface::ATOM);
        $shouldEndAt = $now->modify('+1 hour')->format(\DateTimeInterface::ATOM);

        // Get an establishment owned by the user
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('query {
                    establishments(contractor__id: "%s") {
                        edges {
                            node {
                                id
                                name
                            }
                        }
                    }
                }', $userId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $establishements = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('establishments', $establishements['data']);
        $this->assertEquals('Rooftop Garden', $establishements['data']['establishments']['edges'][0]['node']['name'] ?? null);

        $establishementId = $establishements['data']['establishments']['edges'][0]['node']['id'];

        // Create a heist
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createHeist(input: { 
                        name: "the central park heist", 
                        description: "A riche man is going to the central park with his family. We need to steal his golden car in his apartment.", 
                        startAt: "%s",
                        shouldEndAt: "%s",
                        minimumPayout: 50000,
                        maximumPayout: 10000000,
                        establishment: "%s",
                        preferedTactic: Stealth,
                        difficulty: VeryHard,
                        visibility: Draft,
                        objectives: [],
                        latitude: %s,
                        longitude: %s
                    }) {
                        heist {
                            name
                            location {
                                name
                                placeId
                            }
                        }
                    } 
                }', $startAt, $shouldEndAt, $establishementId, self::MUSEUM_NYC_LATITUDE, self::MUSEUM_NYC_LONGITUDE),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonEquals([
            'data' => [
                'createHeist' => [
                    'heist' => [
                        'name' => 'the central park heist',
                        'location' => [
                            'name' => 'The Newark Museum of Art',
                            'placeId' => 'ChIJ5fsDD4BUwokRxwsQqWQjEMM',
                        ],
                    ],
                ],
            ],
        ]);
    }
}
