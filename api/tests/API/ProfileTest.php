<?php

namespace App\Tests\API;

use App\DataFixtures\ProfileFixtures;
use App\DataFixtures\UserFixtures;
use App\Entity\Profile;
use App\Entity\User;
use App\Tests\AbstractTestCase;

final class ProfileTest extends AbstractTestCase
{
    /**
     * Tests if a user can update their profile.
     */
    public function testUserCanUpdateProfile(): void
    {
        $id = $this->findIriBy(Profile::class, [
            'description' => ProfileFixtures::DATA[UserFixtures::HEISTER_DALLAS]['description'],
        ]);

        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateProfile(input: {
                        id: "%s"
                        description: "New description !"
                    }) {
                        profile {
                            description
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'updateProfile' => [
                    'profile' => [
                        'description' => 'New description !',
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if a user cannot update another user's profile.
     */
    public function testUserCannotUpdateOtherProfile(): void
    {
        $id = $this->findIriBy(Profile::class, [
            'description' => ProfileFixtures::DATA[UserFixtures::HEISTER_DALLAS]['description'],
        ]);

        ['client' => $client] = static::createAuthenticatedClient('hoxton');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateProfile(input: {
                        id: "%s"
                        description: "New description !"
                    }) {
                        profile {
                            description
                        }
                    }
                }', $id),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['updateProfile']['profile'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }
}
