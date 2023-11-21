<?php

namespace App\Tests\API;

use App\Tests\AbstractTestCase;

final class AuthTest extends AbstractTestCase
{
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
    }

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
    }
}
