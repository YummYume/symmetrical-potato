<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\QueryItemResolverInterface;
use App\Entity\User;
use App\Enum\UserStatusEnum;
use App\Helper\ExceptionHelper;
use Symfony\Bundle\SecurityBundle\Security;

final class UserQueryResolver implements QueryItemResolverInterface
{
    public function __construct(
        private readonly Security $security,
        private readonly ExceptionHelper $exceptionHelper,
    ) {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function __invoke(?object $item, array $context): object
    {
        return match ($context['info']->fieldName) {
            'meUser' => $this->me(),
            default => throw $this->exceptionHelper->createTranslatableHttpException(404, 'common.not_found'),
        };
    }

    public function me(): User
    {
        $user = $this->security->getUser();

        if (null === $user || !$user instanceof User || UserStatusEnum::Verified !== $user->getStatus()) {
            throw $this->exceptionHelper->createTranslatableHttpException(401, 'user.not_authenticated');
        }

        return $user;
    }
}
