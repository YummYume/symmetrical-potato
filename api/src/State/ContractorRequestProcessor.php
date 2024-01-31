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
use App\Repository\UserRepository;
use App\Service\Mailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<ContractorRequest, ContractorRequest>
 */
final class ContractorRequestProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<ContractorRequest, ContractorRequest> $persistProcessor
     * @param ProcessorInterface<ContractorRequest, ContractorRequest> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly ExceptionHelper $exceptionHelper,
        private readonly UserRepository $userRepository,
        private readonly Mailer $mailer
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ?ContractorRequest
    {
        if ($operation instanceof DeleteMutation) {
            if ($data instanceof ContractorRequest && $data->getUser() && ContractorRequestStatusEnum::Pending === $data->getStatus()) {
                $this->mailer->sendContractorRequestRefusedEmail($data);
            }

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

            $processedData = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

            foreach ($this->userRepository->findAdmins() as $admin) {
                $this->mailer->sendContractorRequestCreatedAdminEmail($processedData, $admin);
            }

            return $processedData;
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

            $this->mailer->sendContractorRequestAcceptedEmail($data);
            $this->entityManager->persist($user);
            $this->entityManager->flush();
        } elseif (!$accepted && $user) {
            $this->mailer->sendContractorRequestRefusedEmail($data);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
