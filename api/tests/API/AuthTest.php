<?php

namespace App\Tests\API;

use App\Tests\AbstractTestCase;

final class AuthTest extends AbstractTestCase
{
    /**
     * Tests if the meUser query returns null when not authenticated.
     */
    public function testMeNotAuthenticated(): void
    {
        static::createClient()->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'query {
                    meUser {
                        username
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'meUser' => null,
            ],
        ]);
    }

    /**
     * Tests if the meUser query returns the authenticated user.
     */
    public function testMeAuthenticated(): void
    {
        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'query {
                    meUser {
                        username
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'meUser' => [
                    'username' => 'dallas',
                ],
            ],
        ]);
    }

    /**
     * Tests if a user can login.
     */
    public function testSuccessfulLogin(): void
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    loginUser(input: {
                        username: "dallas",
                        password: "xxx"
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
    }

    /**
     * Tests if invalid credentials are rejected.
     */
    public function testInvalidLogin(): void
    {
        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'mutation {
                    loginUser(input: {
                        username: "dallas",
                        password: "invalid"
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
}
