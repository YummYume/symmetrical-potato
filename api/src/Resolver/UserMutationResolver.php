<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use App\Entity\User;
use App\Helper\ExceptionHelper;
use App\Repository\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserMutationResolver implements MutationResolverInterface
{
    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly JWTTokenManagerInterface $JWTManager,
        private readonly UserRepository $userRepository,
        private readonly ExceptionHelper $exceptionHelper
    ) {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function __invoke(?object $item, array $context): ?object
    {
        return match ($context['info']->fieldName) {
            'loginUser' => $this->login($context),
            default => null,
        };
    }

    /**
     * @param array<string, mixed> $context
     */
    public function login(array $context): ?User
    {
        $username = $context['args']['input']['username'] ?? null;
        $password = $context['args']['input']['password'] ?? null;
        $invalidCredentialsException = $this->exceptionHelper->createTranslatableHttpException(401, 'user.invalid_credentials');

        if (empty($username) || empty($password)) {
            throw $invalidCredentialsException;
        }

        $user = $this->userRepository->findOneBy(['username' => $username]);

        if (empty($user) || !$this->passwordHasher->isPasswordValid($user, $password)) {
            throw $invalidCredentialsException;
        }

        $jwt = $this->JWTManager->create($user);
        $expires = $this->JWTManager->parse($jwt)['exp'];

        return $user
            ->setToken($jwt)
            ->setTokenTtl($expires - time())
        ;
    }
}
