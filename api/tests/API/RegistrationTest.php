<?php

namespace App\Tests\API;

use App\Tests\AbstractTestCase;
use DAMA\DoctrineTestBundle\Doctrine\DBAL\StaticDriver;

final class RegistrationTest extends AbstractTestCase
{
    // Disable database isolation to be able to create a user and interact with it.
    // See https://github.com/dmaicher/doctrine-test-bundle/issues/182#issuecomment-963272715
    public static function setUpBeforeClass(): void
    {
        StaticDriver::setKeepStaticConnections(false);
    }

    public static function tearDownAfterClass(): void
    {
        StaticDriver::setKeepStaticConnections(true);
    }

    /**
     * Tests if a user is denied registration with an invalid input.
     */
    public function testInvalidRegistration(): void
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createUser(input: {
                        username: "invalid"
                        plainPassword: "invalid"
                        email: "invalid"
                        reason: "invalid"
                        locale: Fr
                    }) {
                        user {
                            id
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createUser']['user'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a user can register with a valid input.
     */
    public function testValidRegistration(): ?string
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    createUser(input: {
                        username: "test"
                        plainPassword: "48GEDG$fefez"
                        email: "test@test.com"
                        reason: "Hello I wanna be a heister"
                        locale: Fr
                    }) {
                        user {
                            id
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('id', $data['data']['createUser']['user'] ?? []);
        $this->assertArrayNotHasKey('errors', $data);

        return $data['data']['createUser']['user']['id'] ?? null;
    }

    /**
     * Tests if a user cannot login without being validated.
     *
     * @depends testValidRegistration
     */
    public function testUserCannotLoginWithoutValidation(): void
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    loginUser(input: {
                        username: "test",
                        password: "48GEDG$fefez"
                    }) {
                        user {
                            token
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('token', $data['data']['loginUser']['user'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if an unauthenticated user cannot validate an account.
     *
     * @depends testValidRegistration
     */
    public function testUnauthenticatedUserCannotValidateAccount(?string $userId): ?string
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    validateUser(input: {id: "%s", status: Verified}) {
                        user {
                            id
                        }
                    }
                }', $userId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['validateUser']['user'] ?? []);
        $this->assertArrayHasKey('errors', $data);

        return $userId;
    }

    /**
     * Tests if an admin can validate a user's account.
     *
     * @depends testValidRegistration
     */
    public function testAdminCanValidateUser(?string $userId): ?string
    {
        ['client' => $client] = static::createAuthenticatedClient('bain', 'xxx');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    validateUser(input: {id: "%s", status: Verified}) {
                        user {
                            id
                        }
                    }
                }', $userId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('id', $data['data']['validateUser']['user'] ?? []);
        $this->assertArrayNotHasKey('errors', $data);

        return $userId;
    }

    /**
     * Tests if a user can login after being validated.
     *
     * @depends testAdminCanValidateUser
     */
    public function testUserCanLoginAfterValidation(?string $userId): ?string
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    loginUser(input: {
                        username: "test",
                        password: "48GEDG$fefez"
                    }) {
                        user {
                            token
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('token', $data['data']['loginUser']['user'] ?? []);
        $this->assertArrayNotHasKey('errors', $data);

        return $userId;
    }

    /**
     * Tests if an unauthenticated user cannot delete an account.
     *
     * @depends testUserCanLoginAfterValidation
     */
    public function testUnauthenticatedUserCannotDeleteAccount(): void
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['deleteUser']['user'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if an admin can delete a user.
     *
     * @depends testUserCanLoginAfterValidation
     */
    public function testAdminCanDeleteUser(?string $userId): ?string
    {
        ['client' => $client] = static::createAuthenticatedClient('bain', 'xxx');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    deleteUser(input: {id: "%s"}) {
                        user {
                            id
                        }
                    }
                }', $userId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('id', $data['data']['deleteUser']['user'] ?? []);
        $this->assertArrayNotHasKey('errors', $data);

        return $userId;
    }

    /**
     * Tests if a user cannot login after being deleted.
     *
     * @depends testAdminCanDeleteUser
     */
    public function testUserCannotLoginAfterDeletion(): void
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('token', $data['data']['loginUser']['user'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }
}
