<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Service\Mailer;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * @implements ProcessorInterface<User, User>
 */
final class UserProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<User, User> $persistProcessor
     * @param ProcessorInterface<User, User> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly Mailer $mailer
    ) {
    }

    public function process(mixed $user, Operation $operation, array $uriVariables = [], array $context = []): ?User
    {
        if ($operation instanceof DeleteMutation) {
            $this->mailer->sendAccountDeletedEmail($user);

            return $this->removeProcessor->process($user, $operation, $uriVariables, $context);
        }

        if (!$operation instanceof Mutation || !$user instanceof User) {
            return $this->persistProcessor->process($user, $operation, $uriVariables, $context);
        }

        if ('validate' === $operation->getName()) {
            $user->addRole(User::ROLE_HEISTER);

            $this->mailer->sendAccountValidatedEmail($user);

            return $this->persistProcessor->process($user, $operation, $uriVariables, $context);
        }

        if (!$user->getPlainPassword()) {
            if ('kill' === $operation->getName()) {
                $this->mailer->sendAccountKilledEmail($user);
            } elseif ('revive' === $operation->getName()) {
                $this->mailer->sendAccountRevivedEmail($user);
            }

            return $this->persistProcessor->process($user, $operation, $uriVariables, $context);
        }

        // Plain password to hashed password
        $user
            ->setPassword($this->passwordHasher->hashPassword(
                $user,
                $user->getPlainPassword()
            ))
            ->eraseCredentials()
        ;

        if ('resetPassword' === $operation->getName()) {
            $user
                ->setResetToken(null)
                ->setResetTokenRequestedAt(null)
            ;

            $this->mailer->sendPasswordChangedEmail($user);
        }

        return $this->persistProcessor->process($user, $operation, $uriVariables, $context);
    }
}
