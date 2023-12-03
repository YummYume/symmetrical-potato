<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ContractorRequest;
use App\Entity\User;
use App\Enum\ContractorRequestStatusEnum;
use App\Helper\ExceptionHelper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<ContractorRequest>
 */
final class ContractorRequestProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<ContractorRequest> $persistProcessor
     * @param ProcessorInterface<ContractorRequest> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly ExceptionHelper $exceptionHelper
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ?ContractorRequest
    {
        if ($operation instanceof DeleteMutation) {
            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }

        if (!$data instanceof ContractorRequest || !$operation instanceof Mutation) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // Create mutation
        if ('create' === $operation->getName()) {
            if (!$this->security->getUser() instanceof User) {
                throw $this->exceptionHelper->createTranslatableHttpException(403, 'user.not_authenticated');
            }

            $data->setUser($this->security->getUser());

            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        if ('update' !== $operation->getName()) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // Update mutation
        $user = $data->getUser();
        $accepted = ContractorRequestStatusEnum::Accepted === $data->getStatus();

        if ($accepted && $user) {
            $user
                ->removeRole(User::ROLE_HEISTER)
                ->removeRole(User::ROLE_EMPLOYEE)
                ->addRole(User::ROLE_CONTRACTOR)
            ;

            foreach ($user->getCrewMembers() as $crewMember) {
                $this->entityManager->remove($crewMember);
            }

            if (null !== $user->getEmployee()) {
                $this->entityManager->remove($user->getEmployee());
            }

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            // TODO email
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
