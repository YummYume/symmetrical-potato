<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use App\Entity\User;
use App\Repository\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserMutationResolver implements MutationResolverInterface
{
    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly JWTTokenManagerInterface $JWTManager,
        private readonly UserRepository $userRepository
    ) {
    }

    public function __invoke(?object $item, array $context): ?object
    {
        return match ($context['info']->fieldName) {
            'loginUser' => $this->login($context),
            default => null,
        };
    }

    public function login(array $context): ?User
    {
        $username = $context['args']['input']['username'] ?? null;
        $password = $context['args']['input']['password'] ?? null;
        $invalidCredentialsException = new HttpException(401, 'Invalid credentials.');

        if (empty($username) || empty($password)) {
            throw $invalidCredentialsException;
        }

        $user = $this->userRepository->findOneBy(['username' => $username]);

        if (empty($user) || !$this->passwordHasher->isPasswordValid($user, $password)) {
            throw $invalidCredentialsException;
        }

        return $user->setToken($this->JWTManager->create($user));
    }
}
