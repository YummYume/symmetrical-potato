<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * @implements ProcessorInterface<User>
 */
final class UserPasswordHasher implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<User> $processor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $processor,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function process(mixed $user, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$user instanceof User || !$user->getPlainPassword()) {
            return $this->processor->process($user, $operation, $uriVariables, $context);
        }

        $user
            ->setPassword($this->passwordHasher->hashPassword(
                $user,
                $user->getPlainPassword()
            ))
            ->eraseCredentials()
        ;

        return $this->processor->process($user, $operation, $uriVariables, $context);
    }
}
