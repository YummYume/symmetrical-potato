<?php

namespace App\Serializer;

use ApiPlatform\GraphQl\Serializer\SerializerContextBuilderInterface;
use ApiPlatform\Metadata\GraphQl\Operation;
use App\Entity\User;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

#[AsDecorator('api_platform.graphql.serializer.context_builder')]
final class UserContextBuilder implements SerializerContextBuilderInterface
{
    public function __construct(
        #[Autowire('@App\Serializer\UserContextBuilder.inner')] private readonly SerializerContextBuilderInterface $decorated,
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    /**
     * @param  array<string, mixed> $resolverContext
     * @return array<string, mixed>
     */
    public function create(?string $resourceClass, Operation $operation, array $resolverContext, bool $normalization): array
    {
        $context = $this->decorated->create($resourceClass, $operation, $resolverContext, $normalization);

        if (User::class !== $resourceClass || $normalization) {
            return $context;
        }

        // Remove admin groups if user is not admin
        // This is the only way to make this "work" with GraphQL
        if (isset($context['groups']) && !$this->authorizationChecker->isGranted(User::ROLE_ADMIN)) {
            $context['groups'] = array_diff($context['groups'], [User::UPDATE_ADMIN]);
        }

        return $context;
    }
}
