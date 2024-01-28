<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Asset;
use App\Repository\HeistAssetRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<Asset, Asset>
 */
final class AssetProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<Asset, Asset> $persistProcessor
     * @param ProcessorInterface<Asset, Asset> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly EntityManagerInterface $entityManager,
        private readonly HeistAssetRepository $heistAssetRepository
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ?Asset
    {
        if (!$data instanceof Asset || !$operation instanceof DeleteMutation) {
            if ($operation instanceof DeleteMutation) {
                return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
            }

            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $heistAssets = $this->heistAssetRepository->findHeistAssetsByAsset($data);
        $totalAmount = 0.0;

        foreach ($heistAssets as $heistAsset) {
            $amount = $heistAsset->getTotalSpent();
            $totalAmount += $amount;

            if ($heistAsset->getCrewMember()) {
                $user = $heistAsset->getCrewMember()->getUser();
                $user->setBalance($user->getBalance() + $amount);

                $this->entityManager->persist($user);
                // TODO send email
            }

            $this->entityManager->remove($heistAsset);
        }

        $this->entityManager->flush();

        // If the asset is global, then nobody has to return the money (magic)
        if (null === $data->getHeist()) {
            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }

        $contractor = $data->getHeist()->getEstablishment()->getContractor();

        $contractor->setBalance($contractor->getBalance() - $totalAmount);
        $this->entityManager->persist($contractor);
        $this->entityManager->flush();

        return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
    }
}
