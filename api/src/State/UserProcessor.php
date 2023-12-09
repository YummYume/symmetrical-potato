<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * @implements ProcessorInterface<User>
 */
final class UserProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<User> $persistProcessor
     * @param ProcessorInterface<User> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function process(mixed $user, Operation $operation, array $uriVariables = [], array $context = []): ?User
    {
        if ($operation instanceof DeleteMutation) {
            return $this->removeProcessor->process($user, $operation, $uriVariables, $context);
        }

        if (!$operation instanceof Mutation || !$user instanceof User || !$user->getPlainPassword()) {
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

        return $this->persistProcessor->process($user, $operation, $uriVariables, $context);
    }
}
