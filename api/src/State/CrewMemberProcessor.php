<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\CrewMember;
use App\Entity\User;
use App\Helper\ExceptionHelper;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<CrewMember, CrewMember>
 */
final class CrewMemberProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<CrewMember, CrewMember> $persistProcessor
     * @param ProcessorInterface<CrewMember, CrewMember> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
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

        if ('create' === $operation->getName()) {
            $user = $this->security->getUser();
            if (!$user instanceof User) {
                throw $this->exceptionHelper->createTranslatableHttpException(403, 'user.not_authenticated');
            }

            $heist = $crewMember->getHeist();
            if (null === $heist) {
                throw $this->exceptionHelper->createTranslatableHttpException(400, 'heist.not_found');
            }

            if (new \DateTimeImmutable() > $heist->getStartAt()) {
                throw $this->exceptionHelper->createTranslatableHttpException(400, 'heist.already_started');
            }

            $crewMember->setUser($user);
        }

        return $this->persistProcessor->process($crewMember, $operation, $uriVariables, $context);
    }
}
