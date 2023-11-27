<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use App\ApiResource\Token;
use App\Enum\UserStatusEnum;
use App\Helper\ExceptionHelper;
use App\Repository\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class JwtMutationResolver implements MutationResolverInterface
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
            'requestToken' => $this->requestToken($context),
            default => null,
        };
    }

    /**
     * @param array<string, mixed> $context
     */
    public function requestToken(array $context): ?Token
    {
        $username = $context['args']['input']['username'] ?? null;
        $password = $context['args']['input']['password'] ?? null;
        $invalidCredentialsException = $this->exceptionHelper->createTranslatableHttpException(401, 'user.invalid_credentials');

        if (empty($username) || empty($password)) {
            throw $invalidCredentialsException;
        }

        $user = $this->userRepository->findOneBy([
            'username' => $username,
            'status' => UserStatusEnum::Verified,
        ]);

        if (null === $user || !$this->passwordHasher->isPasswordValid($user, $password)) {
            throw $invalidCredentialsException;
        }

        $jwt = $this->JWTManager->create($user);
        $expires = $this->JWTManager->parse($jwt)['exp'];

        return (new Token())
            ->setId($user->getId())
            ->setToken($jwt)
            ->setTokenTtl($expires - time())
        ;
    }
}
