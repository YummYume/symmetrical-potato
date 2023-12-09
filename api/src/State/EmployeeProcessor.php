<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Employee;
use App\Entity\User;
use App\Enum\EmployeeStatusEnum;
use App\Helper\ExceptionHelper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<Employee>
 */
final class EmployeeProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<Employee> $persistProcessor
     * @param ProcessorInterface<Employee> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly ExceptionHelper $exceptionHelper
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ?Employee
    {
        if ($operation instanceof DeleteMutation) {
            if ($data instanceof Employee) {
                $user = $data->getUser();

                if ($user) {
                    $user
                        ->removeRole(User::ROLE_EMPLOYEE)
                        ->addRole(User::ROLE_HEISTER)
                    ;

                    $this->entityManager->persist($user);
                    $this->entityManager->flush();
                }
            }

            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }

        if (!$data instanceof Employee || !$operation instanceof Mutation) {
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

        if ('validate' !== $operation->getName()) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // Validate mutation
        $user = $data->getUser();
        $active = EmployeeStatusEnum::Active === $data->getStatus();

        if ($active && $user) {
            $user
                ->removeRole(User::ROLE_CONTRACTOR)
                ->removeRole(User::ROLE_HEISTER)
                ->addRole(User::ROLE_EMPLOYEE)
            ;

            foreach ($user->getCrewMembers() as $crewMember) {
                $this->entityManager->remove($crewMember);
            }

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            // TODO email
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
