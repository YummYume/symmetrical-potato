<?php

namespace App\Tests\API;

use App\Entity\Establishment;
use App\Tests\AbstractTestCase;

final class EstablishmentTest extends AbstractTestCase
{
    /**
     * Tests if a non contractor user cannot create an establishment.
     */
    public function testNonContractorUserCannotCreateEstablishment(): void
    {
        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createEstablishment(input: {
                        name: "X"
                        description: "AKA Twitter"
                        minimumWage: 5000
                        minimumWorkTimePerWeek: 50
                        contractorCut: 30
                        employeeCut: 30
                        crewCut: 40
                    }) {
                        establishment {
                            id
                            name
                            description
                            minimumWage
                            minimumWorkTimePerWeek
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createEstablishment']['establishment'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a contractor user cannot create an already existing establishment.
     */
    public function testContractorUserCannotCreateAlreadyExistingEstablishment(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('shade');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createEstablishment(input: {
                        name: "Rooftop Garden"
                        description: "Nice garden"
                        minimumWage: 5000
                        minimumWorkTimePerWeek: 50
                        contractorCut: 30
                        employeeCut: 30
                        crewCut: 40
                    }) {
                        establishment {
                            id
                            name
                            description
                            minimumWage
                            minimumWorkTimePerWeek
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createEstablishment']['establishment'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a contractor user can create an establishment.
     */
    public function testContractorUserCanCreateEstablishment(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('shade');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createEstablishment(input: {
                        name: "X"
                        description: "AKA Twitter"
                        minimumWage: 5000
                        minimumWorkTimePerWeek: 50
                        contractorCut: 30
                        employeeCut: 30
                        crewCut: 40
                    }) {
                        establishment {
                            name
                            description
                            minimumWage
                            minimumWorkTimePerWeek
                            contractorCut
                            employeeCut
                            crewCut
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'createEstablishment' => [
                    'establishment' => [
                        'name' => 'X',
                        'description' => 'AKA Twitter',
                        'minimumWage' => 5000,
                        'minimumWorkTimePerWeek' => 50,
                        'contractorCut' => 30,
                        'employeeCut' => 30,
                        'crewCut' => 40,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if a contractor user can update an establishment.
     */
    public function testContractorUserCanUpdateEstablishment(): void
    {
        $id = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient('shade');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateEstablishment(input: {
                        id: "%s"
                        description: "New description !"
                    }) {
                        establishment {
                            description
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'updateEstablishment' => [
                    'establishment' => [
                        'description' => 'New description !',
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if a contractor cannot update an establishment that does not belong to them.
     */
    public function testContractorCannotUpdateEstablishmentThatDoesNotBelongToThem(): void
    {
        $id = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient('vlad');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateEstablishment(input: {
                        id: "%s"
                        description: "New description !"
                    }) {
                        establishment {
                            description
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('description', $data['data']['updateEstablishment']['establishment'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a non contractor user cannot update an establishment.
     */
    public function testNonContractorUserCannotUpdateEstablishment(): void
    {
        $id = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateEstablishment(input: {
                        id: "%s"
                        description: "New description !"
                    }) {
                        establishment {
                            description
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('description', $data['data']['updateEstablishment']['establishment'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a contractor user can delete an establishment.
     */
    public function testContractorUserCanDeleteEstablishment(): void
    {
        $id = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient('shade');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    deleteEstablishment(input: {
                        id: "%s"
                    }) {
                        establishment {
                            id
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'deleteEstablishment' => [
                    'establishment' => [
                        'id' => $id,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if a contractor user cannot delete an establishment that does not belong to them.
     */
    public function testContractorUserCannotDeleteEstablishmentThatDoesNotBelongToThem(): void
    {
        $id = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient('vlad');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    deleteEstablishment(input: {
                        id: "%s"
                    }) {
                        establishment {
                            id
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['deleteEstablishment']['establishment'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a non contractor user cannot delete an establishment.
     */
    public function testNonContractorUserCannotDeleteEstablishment(): void
    {
        $id = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    deleteEstablishment(input: {
                        id: "%s"
                    }) {
                        establishment {
                            id
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['deleteEstablishment']['establishment'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a contractor cannot have more than 10 establishments.
     */
    public function testContractorCannotHaveMoreThanTenEstablishments(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('shade');

        foreach (range(1, 9) as $i) {
            $client->request('POST', '/graphql', [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'query' => sprintf('mutation {
                        createEstablishment(input: {
                            name: "X%s"
                            description: "AKA Twitter"
                            minimumWage: 5000
                            minimumWorkTimePerWeek: 50
                            contractorCut: 30
                            employeeCut: 30
                            crewCut: 40
                        }) {
                            establishment {
                                name
                            }
                        }
                    }', $i),
                ],
            ]);

            $this->assertResponseIsSuccessful();
            $this->assertJsonContains([
                'data' => [
                    'createEstablishment' => [
                        'establishment' => [
                            'name' => sprintf('X%s', $i),
                        ],
                    ],
                ],
            ]);
        }

        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createEstablishment(input: {
                        name: "X%s"
                        description: "AKA Twitter"
                        minimumWage: 5000
                        minimumWorkTimePerWeek: 50
                        contractorCut: 30
                        employeeCut: 30
                        crewCut: 40
                    }) {
                        establishment {
                            name
                        }
                    }
                }', $i),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('name', $data['data']['createEstablishment']['establishment'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }
}
