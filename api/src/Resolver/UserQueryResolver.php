<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\QueryItemResolverInterface;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\HttpException;

final class UserQueryResolver implements QueryItemResolverInterface
{
    public function __construct(private readonly Security $security)
    {
    }

    public function __invoke(?object $item, array $context): object
    {
        return match ($context['info']->fieldName) {
            'meUser' => $this->me(),
            default => throw new HttpException(404, 'Not Found'),
        };
    }

    public function me(): User
    {
        $user = $this->security->getUser();

        if (null === $user) {
            throw new HttpException(401, 'Not Authenticated');
        }

        return $user;
    }
}
