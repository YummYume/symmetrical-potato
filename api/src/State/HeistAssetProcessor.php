<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\Validator\ValidatorInterface;
use App\Entity\HeistAsset;
use App\Entity\User;
use App\Helper\ExceptionHelper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<HeistAsset, HeistAsset>
 */
final class HeistAssetProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<HeistAsset, HeistAsset> $persistProcessor
     * @param ProcessorInterface<HeistAsset, HeistAsset> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly EntityManagerInterface $entityManager,
        private readonly ValidatorInterface $validator,
        private readonly Security $security,
        private readonly ExceptionHelper $exceptionHelper,
    ) {
    }

    public function process(mixed $heistAsset, Operation $operation, array $uriVariables = [], array $context = []): ?HeistAsset
    {
        if ($operation instanceof DeleteMutation) {
            return $this->removeProcessor->process($heistAsset, $operation, $uriVariables, $context);
        }

        if (!$heistAsset instanceof HeistAsset || !$operation instanceof Mutation) {
            return $this->persistProcessor->process($heistAsset, $operation, $uriVariables, $context);
        }

        if ('create' === $operation->getName()) {
            $user = $this->security->getUser();

            if (!$user instanceof User) {
                throw $this->exceptionHelper->createTranslatableHttpException(403, 'common.not_authenticated');
            }

            if ($user !== $heistAsset->getCrewMember()->getUser()) {
                throw $this->exceptionHelper->createTranslatableHttpException(400, 'heist_asset.heist_required');
            }

            $price = $heistAsset->getAsset()->getPrice() * $heistAsset->getQuantity();

            if ($user->getBalance() - $price < 0) {
                throw $this->exceptionHelper->createTranslatableHttpException(400, 'heist_asset.insufficient_funds');
            }

            $user->setBalance($user->getBalance() - $price);

            if (!$heistAsset->getAsset()->isGlobalAsset()) {
                $contractor = $heistAsset->getCrewMember()->getHeist()->getEstablishment()->getContractor();
                if (null !== $contractor) {
                    $contractor->setBalance($contractor->getBalance() + $price);
                    $this->entityManager->persist($contractor);
                }
            }

            $this->entityManager->persist($user);

            $heistAsset->setTotalSpent($price);

            $this->validator->validate($heistAsset, ['groups' => HeistAsset::CREATE]);
        }

        if ('update' === $operation->getName()) {
            $user = $this->security->getUser();

            if (!$user instanceof User) {
                throw $this->exceptionHelper->createTranslatableHttpException(403, 'common.not_authenticated');
            }

            if ($user === $heistAsset->getCrewMember()->getUser()) {
                throw $this->exceptionHelper->createTranslatableHttpException(400, 'heist_asset.heist_required');
            }

            $price = $heistAsset->getAsset()->getPrice() * $heistAsset->getQuantity() - $heistAsset->getTotalSpent();

            if ($user->getBalance() - $price < 0) {
                throw $this->exceptionHelper->createTranslatableHttpException(400, 'heist_asset.insufficient_funds');
            }

            $user->setBalance($user->getBalance() - $price);

            if (!$heistAsset->getAsset()->isGlobalAsset()) {
                $contractor = $heistAsset->getCrewMember()->getHeist()->getEstablishment()->getContractor();
                if (null !== $contractor) {
                    $contractor->setBalance($contractor->getBalance() + $price);
                    $this->entityManager->persist($contractor);
                }
            }

            $this->entityManager->persist($user);

            $heistAsset->setTotalSpent($price);

            $this->validator->validate($heistAsset, ['groups' => HeistAsset::UPDATE]);
        }

        return $this->persistProcessor->process($heistAsset, $operation, $uriVariables, $context);
    }
}
