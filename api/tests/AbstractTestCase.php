<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use ApiPlatform\Symfony\Bundle\Test\Client;

abstract class AbstractTestCase extends ApiTestCase
{
    /**
     * Creates a client with a default Authorization header.
     *
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
                    requestToken(input: {
                        username: "%s",
                        password: "%s"
                    }) {
                        token {
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
                    'Authorization' => 'Bearer '.$data['data']['requestToken']['token']['token'],
                ],
            ]);

            /**
             * @var string|null $userId
             */
            $userId = $data['data']['requestToken']['token']['id'];
        } catch (\Exception $e) {
            printf('Could not login user "%s" with password "%s" : %s.', $username, $password, $e->getMessage());
        }

        return ['client' => $client, 'userId' => $userId];
    }

    /**
     * This method checks if the resource is the same as the expected result. Can be given a user to authenticate.
     *
     * @param string               $grapqlQuery The graphql query to execute
     * @param array<string, mixed> $result      The expected result
     * @param string|null          $username    The username to use to authenticate the user
     * @param string|null          $password    The password to use to authenticate the user
     */
    protected static function checkResourceJsonEquals(
        string $grapqlQuery,
        array $result,
        ?string $username = 'dallas',
        ?string $password = 'xxx'
    ): void {
        if ($username) {
            $client = static::createAuthenticatedClient($username, $password)['client'];
        } else {
            $client = static::createClient();
        }

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
