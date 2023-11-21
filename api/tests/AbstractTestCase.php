<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use ApiPlatform\Symfony\Bundle\Test\Client;

abstract class AbstractTestCase extends ApiTestCase
{
    /**
     * @return array{client: Client, userId: string|null}
     */
    protected static function createAuthenticatedClient(?string $username = 'dallas', string $password = 'xxx'): array
    {
        $userId = null;

        $client = static::createClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    loginUser(input: {
                        username: "%s",
                        password: "%s"
                    }) {
                        user {
                            id
                            token
                        }
                    }
                }', $username, $password),
            ],
        ]);

        try {
            $data = json_decode($client->getResponse()->getContent(), true);

            $client->setDefaultOptions([
                'headers' => [
                    'Authorization' => 'Bearer '.$data['data']['loginUser']['user']['token'],
                ],
            ]);

            /**
             * @var string|null $userId
             */
            $userId = $data['data']['loginUser']['user']['id'];
        } catch (\Exception $e) {
            printf('Could not login user "%s" with password "%s".', $username, $password);
        }

        return ['client' => $client, 'userId' => $userId];
    }

    /**
     * @param array<string, mixed> $result
     *
     * @description This method check depending on the user if the result is the same as the expected one
     */
    protected static function checkRessourceHas(string $grapqlQuery, array $result, string $username = null): void
    {
        ['client' => $client] = $username ? static::createAuthenticatedClient($username) : static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('query {
                    %s
                }', $grapqlQuery),
            ],
        ]);

        static::assertResponseIsSuccessful();

        static::assertJsonEquals([
            'data' => $result,
        ]);
    }
}
