<?php

namespace App\Validator;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\CrewMember;
use App\Entity\User;
use App\Helper\ExceptionHelper;
use App\Repository\UserRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class CrewMemberProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly UserRepository $userRepository,
        private readonly Security $security,
        private readonly ExceptionHelper $exceptionHelper
    ) {
    }

    public function process(mixed $crewMember, Operation $operation, array $uriVariables = [], array $context = []): ?CrewMember
    {
        if ($operation instanceof DeleteMutation) {
            return $this->removeProcessor->process($crewMember, $operation, $uriVariables, $context);
        }

        if (!$crewMember instanceof CrewMember || !$operation instanceof Mutation) {
            return $this->persistProcessor->process($crewMember, $operation, $uriVariables, $context);
        }

        // Create mutation
        if ('create' === $operation->getName()) {
            if (!$this->security->getUser() instanceof User) {
                throw $this->exceptionHelper->createTranslatableHttpException(403, 'user.not_authenticated');
            }

            return $this->persistProcessor->process($crewMember, $operation, $uriVariables, $context);
        }

        return $this->persistProcessor->process($crewMember, $operation, $uriVariables, $context);
    }
}
