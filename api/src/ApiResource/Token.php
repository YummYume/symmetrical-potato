<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Resolver\JwtMutationResolver;
use Symfony\Component\Serializer\Annotation\Ignore;

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
            security: 'user == null',
            validate: false,
            read: false,
            write: false,
        ),
        new Mutation(
            name: 'refresh',
            description: 'Refresh a JWT token.',
            resolver: JwtMutationResolver::class,
            args: [
                'refreshToken' => [
                    'type' => 'String!',
                    'description' => 'The refresh token to use to refresh the JWT token. It must be the same as the one provided when the JWT token was requested.',
                ],
            ],
            validate: false,
            read: false,
            write: false,
        ),
        new Mutation(
            name: 'revoke',
            description: 'Revoke a refresh token.',
            resolver: JwtMutationResolver::class,
            args: [
                'refreshToken' => [
                    'type' => 'String!',
                    'description' => 'The refresh token to revoke.',
                ],
            ],
            security: 'user != null',
            validate: false,
            read: false,
            write: false
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

    #[ApiProperty]
    private ?string $refreshToken = null;

    #[ApiProperty]
    private ?int $refreshTokenTtl = null;

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

    public function getRefreshToken(): ?string
    {
        return $this->refreshToken;
    }

    public function setRefreshToken(?string $refreshToken): static
    {
        $this->refreshToken = $refreshToken;

        return $this;
    }

    public function getRefreshTokenTtl(): ?int
    {
        return $this->refreshTokenTtl;
    }

    public function setRefreshTokenTtl(?int $refreshTokenTtl): static
    {
        $this->refreshTokenTtl = $refreshTokenTtl;

        return $this;
    }

    #[Ignore]
    public static function getResource(): null
    {
        return null;
    }

    /**
     * @return array<string, mixed>
     */
    #[Ignore]
    public static function getResources(): array
    {
        return [];
    }
}
