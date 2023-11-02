<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\QueryItemResolverInterface;
use App\Entity\User;
use App\Helper\ExceptionHelper;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class UserQueryResolver implements QueryItemResolverInterface
{
    public function __construct(
        #[CurrentUser] private readonly ?User $user,
        private readonly ExceptionHelper $exceptionHelper
    ) {
    }

    public function __invoke(?object $item, array $context): object
    {
        return match ($context['info']->fieldName) {
            'meUser' => $this->me(),
            default => throw $this->exceptionHelper->createTranslatableHttpException(404, 'common.not_found'),
        };
    }

    public function me(): User
    {
        if (null === $this->user) {
            throw $this->exceptionHelper->createTranslatableHttpException(401, 'user.not_authenticated');
        }

        return $this->user;
    }
}
