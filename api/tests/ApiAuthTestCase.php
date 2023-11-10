<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use ApiPlatform\Symfony\Bundle\Test\Client;

abstract class ApiAuthTestCase extends ApiTestCase
{
    protected static function createAuthenticatedClient(string $username = 'dallas', string $password = 'xxx'): Client
    {
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
        } catch (\Exception $e) {
            printf('Could not login user "%s" with password "%s".', $username, $password);
        }

        return $client;
    }
}
