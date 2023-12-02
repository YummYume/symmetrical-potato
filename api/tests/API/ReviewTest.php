<?php

namespace App\Tests\API;

use App\Entity\Establishment;
use App\Entity\Location;
use App\Tests\AbstractTestCase;

final class ReviewTest extends AbstractTestCase
{
    /**
     * Tests if a user cannot create a review for an establishment and location at the same time.
     */
    public function testUserCannotCreateReviewForEstablishmentAndLocation(): void
    {
        $establishmentId = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);
        $locationId = $this->findIriBy(Location::class, ['name' => 'Chase Bank']);

        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createReview(
                        input: {
                            comment: "Great place",
                            rating: Four,
                            location: "%s"
                            establishment: "%s"
                        }
                    ) {
                        review {
                            comment
                            ratingNumber
                        }
                    }
                }', $locationId, $establishmentId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createReview']['review'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a user can create a review for a location they are related to.
     */
    public function testUserCanCreateReviewForLocation(): void
    {
        $locationId = $this->findIriBy(Location::class, ['name' => 'Chase Bank']);

        ['client' => $client] = static::createAuthenticatedClient('wolf');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createReview(
                        input: {
                            comment: "Great place",
                            rating: Four,
                            location: "%s"
                        }
                    ) {
                        review {
                            comment
                            ratingNumber
                        }
                    }
                }', $locationId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonEquals([
            'data' => [
                'createReview' => [
                    'review' => [
                        'comment' => 'Great place',
                        'ratingNumber' => 4,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if a user cannot create a review for a location twice.
     */
    public function testUserCannotCreateReviewForSameLocationTwice(): void
    {
        $locationId = $this->findIriBy(Location::class, ['name' => 'Chase Bank']);

        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createReview(
                        input: {
                            comment: "Great place",
                            rating: Four,
                            location: "%s"
                        }
                    ) {
                        review {
                            comment
                            ratingNumber
                        }
                    }
                }', $locationId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createReview']['review'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a user cannot create a review for a location they are not related to.
     */
    public function testUserCannotCreateReviewForUnrelatedLocation(): void
    {
        $locationId = $this->findIriBy(Location::class, ['name' => 'Chase Bank']);

        ['client' => $client] = static::createAuthenticatedClient('hoxton');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createReview(
                        input: {
                            comment: "Great place",
                            rating: Four,
                            location: "%s"
                        }
                    ) {
                        review {
                            comment
                            ratingNumber
                        }
                    }
                }', $locationId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createReview']['review'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a user can create a review for an establishment they are related to.
     */
    public function testUserCanCreateReviewForEstablishment(): void
    {
        $establishmentId = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient('wolf');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createReview(
                        input: {
                            comment: "Amazing establishment, really quick",
                            rating: FourPointFive,
                            establishment: "%s"
                        }
                    ) {
                        review {
                            comment
                            ratingNumber
                        }
                    }
                }', $establishmentId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonEquals([
            'data' => [
                'createReview' => [
                    'review' => [
                        'comment' => 'Amazing establishment, really quick',
                        'ratingNumber' => 4.5,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if a user cannot create a review for an establishment twice.
     */
    public function testUserCannotCreateReviewForSameEstablishmentTwice(): void
    {
        $establishmentId = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createReview(
                        input: {
                            comment: "Amazing establishment, really quick",
                            rating: FourPointFive,
                            establishment: "%s"
                        }
                    ) {
                        review {
                            comment
                            ratingNumber
                        }
                    }
                }', $establishmentId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createReview']['review'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a user cannot create a review for an establishment they are not related to.
     */
    public function testUserCannotCreateReviewForUnrelatedEstablishment(): void
    {
        $establishmentId = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient('hoxton');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createReview(
                        input: {
                            comment: "Amazing establishment, really quick",
                            rating: FourPointFive,
                            establishment: "%s"
                        }
                    ) {
                        review {
                            comment
                            ratingNumber
                        }
                    }
                }', $establishmentId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createReview']['review'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }
}
