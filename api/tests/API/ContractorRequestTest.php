<?php

namespace App\Tests\API;

use App\Entity\User;
use App\Tests\AbstractTestCase;

final class ContractorRequestTest extends AbstractTestCase
{
    /**
     * Tests if a contractor cannot send a contractor request.
     */
    public function testContractorCannotSendRequest(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('shade');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createContractorRequest(input: {
                        reason: "I\'m already a contractor."
                    }) {
                        contractorRequest {
                            reason
                            status
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createContractorRequest']['contractorRequest'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a user cannot query contractor requests.
     */
    public function testUserCannotQueryContractorRequests(): void
    {
        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'query {
                    contractorRequests {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('edges', $data['data']['contractorRequests'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if an admin can query contractor requests.
     */
    public function testAdminCanQueryContractorRequests(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('bain');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'query {
                    contractorRequests {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('edges', $data['data']['contractorRequests'] ?? []);
        $this->assertArrayNotHasKey('errors', $data);
    }

    /**
     * Tests if a non contractor user can send a contractor request and if it is pending.
     */
    public function testNonContractorCanSendContractorRequest(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('chains');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createContractorRequest(input: {
                        reason: "I\'m tired of being a heister. I want to be a contractor."
                    }) {
                        contractorRequest {
                            id
                            reason
                            status
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('id', $data['data']['createContractorRequest']['contractorRequest'] ?? []);
        $this->assertArrayNotHasKey('errors', $data);
    }

    /**
     * Tests if a user cannot send another contractor request if they already have one pending.
     */
    public function testUserCannotSendSecondContractorRequest(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('pending_contractor');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createContractorRequest(input: {
                        reason: "I\'m tired of being a heister. I want to be a contractor."
                    }) {
                        contractorRequest {
                            reason
                            status
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createContractorRequest']['contractorRequest'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if an admin can approve a pending contractor request.
     */
    public function testAdminCanApprovePendingContractorRequest(): string
    {
        ['client' => $pendingClient] = static::createAuthenticatedClient('pending_contractor');
        $pendingClient->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'query {
                    getMeUser {
                        contractorRequest {
                            id
                        }
                    }
                }',
            ],
        ]);

        $id = json_decode($pendingClient->getResponse()->getContent(), true)['data']['getMeUser']['contractorRequest']['id'];

        ['client' => $client] = static::createAuthenticatedClient('bain');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateContractorRequest(input: {status: Accepted, adminComment: "Super comment", id: "%s"}) {
                        contractorRequest {
                            id
                            reason
                            status
                            adminComment
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonEquals([
            'data' => [
                'updateContractorRequest' => [
                    'contractorRequest' => [
                        'id' => $id,
                        'reason' => 'You want to earn some money? I have the right heist for you.',
                        'status' => 'Accepted',
                        'adminComment' => 'Super comment',
                    ],
                ],
            ],
        ]);

        return $id;
    }

    /**
     * Tests if an admin cannot approve a non pending contractor request.
     */
    public function testAdminCannotApproveNonPendingContractorRequest(): void
    {
        ['client' => $pendingClient] = static::createAuthenticatedClient('shade');
        $pendingClient->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'query {
                    getMeUser {
                        contractorRequest {
                            id
                        }
                    }
                }',
            ],
        ]);

        $id = json_decode($pendingClient->getResponse()->getContent(), true)['data']['getMeUser']['contractorRequest']['id'];

        ['client' => $client] = static::createAuthenticatedClient('bain');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => ['query' => sprintf('mutation {
                updateContractorRequest(input: {status: Accepted, adminComment: "Super comment", id: "%s"}) {
                    contractorRequest {
                        id
                        reason
                        status
                    }
                }
            }', $id)],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['updateContractorRequest']['contractorRequest'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a user obtained the contractor role after their contractor request was approved.
     *
     * @depends testAdminCanApprovePendingContractorRequest
     */
    public function testUserObtainedContractorRole(string $id): void
    {
        ['client' => $adminClient] = static::createAuthenticatedClient('bain');
        $adminClient->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateContractorRequest(input: {status: Accepted, adminComment: "Super comment", id: "%s"}) {
                        contractorRequest {
                            id
                            reason
                            status
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        ['client' => $client] = static::createAuthenticatedClient('pending_contractor');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'query {
                    getMeUser {
                        roles
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'getMeUser' => [
                    'roles' => [User::ROLE_CONTRACTOR, User::ROLE_USER],
                ],
            ],
        ]);
    }
}
