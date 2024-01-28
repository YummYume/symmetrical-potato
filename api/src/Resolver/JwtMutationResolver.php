<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use App\ApiResource\Token;
use App\Entity\User;
use App\Enum\UserStatusEnum;
use App\Helper\ExceptionHelper;
use App\Repository\UserRepository;
use Gesdinet\JWTRefreshTokenBundle\Generator\RefreshTokenGeneratorInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

final class JwtMutationResolver implements MutationResolverInterface
{
    public const REFRESH_TOKEN_TTL = 604800; // 7 days

    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly JWTTokenManagerInterface $JWTManager,
        private readonly UserRepository $userRepository,
        private readonly ExceptionHelper $exceptionHelper,
        private readonly RefreshTokenManagerInterface $refreshTokenManager,
        private readonly RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private readonly TokenStorageInterface $tokenStorageInterface,
        private readonly Security $security
    ) {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function __invoke(?object $item, array $context): ?object
    {
        return match ($context['info']->fieldName) {
            'requestToken' => $this->requestToken($context),
            'refreshToken' => $this->refreshToken($context),
            'revokeToken' => $this->revokeToken($context),
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
        $refreshToken = $this->refreshTokenGenerator->createForUserWithTtl($user, self::REFRESH_TOKEN_TTL);

        $this->refreshTokenManager->save($refreshToken);

        return (new Token())
            ->setId($user->getId())
            ->setToken($jwt)
            ->setTokenTtl($expires - time())
            ->setRefreshToken($refreshToken->getRefreshToken())
            ->setRefreshTokenTtl(self::REFRESH_TOKEN_TTL)
        ;
    }

    /**
     * @param array<string, mixed> $context
     */
    public function refreshToken(array $context): ?Token
    {
        $refreshTokenInput = $context['args']['input']['refreshToken'] ?? null;
        $decodedJwtToken = $this->JWTManager->decode($this->tokenStorageInterface->getToken());
        $cannotRefreshTokenException = $this->exceptionHelper->createTranslatableHttpException(401, 'user.cannot_refresh_token');

        if (empty($refreshTokenInput) || !isset($decodedJwtToken['username'])) {
            throw $cannotRefreshTokenException;
        }

        $refreshToken = $this->refreshTokenManager->get($refreshTokenInput);

        if (null === $refreshToken || !$refreshToken->isValid() || $decodedJwtToken['username'] !== $refreshToken->getUsername()) {
            throw $cannotRefreshTokenException;
        }

        $username = $refreshToken->getUsername();
        $user = $this->userRepository->findOneBy([
            'username' => $username,
            'status' => UserStatusEnum::Verified,
        ]);

        if (null === $user) {
            throw $cannotRefreshTokenException;
        }

        $jwt = $this->JWTManager->create($user);
        $expires = $this->JWTManager->parse($jwt)['exp'];
        $newToken = $this->refreshTokenGenerator->createForUserWithTtl($user, self::REFRESH_TOKEN_TTL);

        $this->refreshTokenManager->delete($refreshToken);
        $this->refreshTokenManager->save($newToken);

        return (new Token())
            ->setId($user->getId())
            ->setToken($jwt)
            ->setTokenTtl($expires - time())
            ->setRefreshToken($newToken->getRefreshToken())
            ->setRefreshTokenTtl(self::REFRESH_TOKEN_TTL)
        ;
    }

    /**
     * @param array<string, mixed> $context
     */
    public function revokeToken(array $context): ?Token
    {
        $refreshTokenInput = $context['args']['input']['refreshToken'] ?? null;
        $cannotRevokeTokenException = $this->exceptionHelper->createTranslatableHttpException(401, 'user.cannot_revoke_token');

        if (empty($refreshTokenInput)) {
            throw $cannotRevokeTokenException;
        }

        $refreshToken = $this->refreshTokenManager->get($refreshTokenInput);
        /**
         * @var User
         */
        $user = $this->security->getUser();

        if (null === $refreshToken || !$refreshToken->isValid() || $user->getUserIdentifier() !== $refreshToken->getUsername()) {
            throw $cannotRevokeTokenException;
        }

        $this->refreshTokenManager->delete($refreshToken);

        return (new Token())->setId($user->getId());
    }
}
