<?php

namespace App\Tests\API;

use App\Entity\User;
use App\Tests\AbstractTestCase;
use DAMA\DoctrineTestBundle\Doctrine\DBAL\StaticDriver;

final class ContractorRequestTest extends AbstractTestCase
{
    public static function setUpBeforeClass(): void
    {
        StaticDriver::setKeepStaticConnections(false);
    }

    public static function tearDownAfterClass(): void
    {
        StaticDriver::setKeepStaticConnections(true);
    }

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
    public function testNonContractorCanSendContractorRequest(): string
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

        return $data['data']['createContractorRequest']['contractorRequest']['id'];
    }

    /**
     * Tests if a user cannot send another contractor request if they already have one pending.
     *
     * @depends testNonContractorCanSendContractorRequest
     */
    public function testUserCannotSendSecondContractorRequest(string $id): string
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

        return $id;
    }

    /**
     * Tests if an admin can approve a pending contractor request.
     *
     * @depends testUserCannotSendSecondContractorRequest
     */
    public function testAdminCanApprovePendingContractorRequest(string $id): string
    {
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
                        'reason' => "I'm tired of being a heister. I want to be a contractor.",
                        'status' => 'Accepted',
                    ],
                ],
            ],
        ]);

        return $id;
    }

    /**
     * Tests if an admin cannot approve a non pending contractor request.
     *
     * @depends testAdminCanApprovePendingContractorRequest
     */
    public function testAdminCannotApproveNonPendingContractorRequest(string $id): void
    {
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
    public function testUserObtainedContractorRole(): void
    {
        ['client' => $client] = static::createAuthenticatedClient('chains');
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
