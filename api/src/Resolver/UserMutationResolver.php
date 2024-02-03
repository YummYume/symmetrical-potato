<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use App\Entity\User;
use App\Enum\UserStatusEnum;
use App\Helper\ExceptionHelper;
use App\Repository\UserRepository;
use App\Service\Mailer;
use Doctrine\ORM\EntityManagerInterface;

final class UserMutationResolver implements MutationResolverInterface
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly ExceptionHelper $exceptionHelper,
        private readonly EntityManagerInterface $entityManager,
        private readonly Mailer $mailer
    ) {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function __invoke(?object $item, array $context): ?object
    {
        return match ($context['info']->fieldName) {
            'requestResetPasswordUser' => $this->requestResetPassword($context),
            'resetPasswordUser' => $this->resetPassword($context),
            default => null,
        };
    }

    /**
     * @param array<string, mixed> $context
     *
     * Note: This method always returns null to avoid leaking information about the existence of a user
     */
    public function requestResetPassword(array $context): null
    {
        $email = $context['args']['input']['email'] ?? null;
        $username = $context['args']['input']['username'] ?? null;

        if (null === $email && null === $username) {
            return null;
        }

        $user = $this->userRepository->findOneBy([
            'email' => $email,
            'username' => $username,
            'status' => UserStatusEnum::Verified->value,
        ]);

        if (null === $user) {
            return null;
        }

        $user
            ->setResetToken(bin2hex(random_bytes(32)))
            ->setResetTokenRequestedAt(new \DateTimeImmutable())
        ;

        $this->entityManager->flush();
        $this->mailer->sendResetPasswordEmail($user);

        return null;
    }

    /**
     * @param array<string, mixed> $context
     */
    public function resetPassword(array $context): ?User
    {
        $resetToken = $context['args']['input']['resetToken'] ?? null;

        if (null === $resetToken) {
            throw $this->exceptionHelper->createTranslatableHttpException(401, 'user.reset.invalid_token');
        }

        $user = $this->userRepository->findUserByNonExpiredResetToken($resetToken);

        if (null === $user) {
            throw $this->exceptionHelper->createTranslatableHttpException(401, 'user.reset.invalid_token');
        }

        $user->setPlainPassword($context['args']['input']['plainPassword'] ?? null);

        return $user;
    }
}
