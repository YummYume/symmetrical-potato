<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Resolver\JwtMutationResolver;

#[ApiResource(
    shortName: 'Token',
    operations: [],
    graphQlOperations: [
        new Query(
            provider: self::class.'::getResource',
            validate: false,
            read: false,
        ),
        new QueryCollection(
            provider: self::class.'::getResources',
            validate: false,
            read: false,
        ),
        new Mutation(
            name: 'request',
            description: 'Request a new JWT token.',
            resolver: JwtMutationResolver::class,
            args: [
                'username' => [
                    'type' => 'String!',
                    'description' => 'The username of the user to authenticate.',
                ],
                'password' => [
                    'type' => 'String!',
                    'description' => 'The password of the user to authenticate.',
                ],
            ],
            validate: false,
            read: false,
            write: false,
        ),
    ]
)]
class Token
{
    #[ApiProperty(identifier: true)]
    private ?string $id = null;

    #[ApiProperty]
    private ?string $token = null;

    #[ApiProperty]
    private ?int $tokenTtl = null;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(?string $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(?string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function getTokenTtl(): ?int
    {
        return $this->tokenTtl;
    }

    public function setTokenTtl(?int $tokenTtl): static
    {
        $this->tokenTtl = $tokenTtl;

        return $this;
    }

    public static function getResource(): null
    {
        return null;
    }

    /**
     * @return array<string, mixed>
     */
    public static function getResources(): array
    {
        return [];
    }
}
