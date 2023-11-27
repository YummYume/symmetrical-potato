<?php

namespace App\Tests\API;

use App\Tests\AbstractTestCase;

final class AuthTest extends AbstractTestCase
{
    /**
     * Tests if the getMeUser query returns null when not authenticated.
     */
    public function testMeNotAuthenticated(): void
    {
        static::createClient()->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => 'query {
                    getMeUser {
                        email
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'getMeUser' => null,
            ],
        ]);
    }

    /**
     * Tests if the getMeUser query returns the authenticated user.
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
                    getMeUser {
                        email
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'getMeUser' => [
                    'email' => 'dallas@sp.com',
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
                    requestToken(input: {
                        username: "dallas",
                        password: "xxx"
                    }) {
                        token {
                            token
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('token', $data['data']['requestToken']['token'] ?? []);
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
                    requestToken(input: {
                        username: "dallas",
                        password: "invalid"
                    }) {
                        token {
                            token
                        }
                    }
                }',
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('token', $data['data']['requestToken']['token'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }
}
