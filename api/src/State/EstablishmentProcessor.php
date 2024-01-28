<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\Validator\ValidatorInterface;
use App\Entity\Establishment;
use App\Entity\User;
use App\Helper\ExceptionHelper;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<Establishment, Establishment>
 */
final class EstablishmentProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<Establishment, Establishment> $persistProcessor
     * @param ProcessorInterface<Establishment, Establishment> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly Security $security,
        private readonly ExceptionHelper $exceptionHelper,
        private readonly ValidatorInterface $validator
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ?Establishment
    {
        if ($operation instanceof DeleteMutation) {
            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }

        if (!$data instanceof Establishment || !$operation instanceof Mutation || 'create' !== $operation->getName()) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $user = $this->security->getUser();

        if (!$user instanceof User) {
            throw $this->exceptionHelper->createTranslatableHttpException(403, 'user.not_authenticated');
        }

        $data->setContractor($user);

        // Re-run validation
        $this->validator->validate($data, ['groups' => [Establishment::CREATE]]);

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
