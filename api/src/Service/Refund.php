<?php

namespace App\Service;

use App\Entity\Asset;
use App\Entity\Heist;
use App\Repository\AssetRepository;
use App\Repository\HeistAssetRepository;
use Doctrine\ORM\EntityManagerInterface;

final class Refund
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HeistAssetRepository $heistAssetRepository,
        private readonly AssetRepository $assetRepository,
        private readonly Mailer $mailer
    ) {
    }

    /**
     * @description Refund the asset
     */
    public function refundAsset(Asset $asset): void
    {
        $heistAssets = $this->heistAssetRepository->findHeistAssetsByAsset($asset);
        $totalAmount = 0.0;

        foreach ($heistAssets as $heistAsset) {
            $amount = $heistAsset->getTotalSpent();
            $totalAmount += $amount;

            if ($heistAsset->getCrewMember()) {
                $user = $heistAsset->getCrewMember()->getUser();
                $user->setBalance($user->getBalance() + $amount);

                $this->mailer->sendCrewMemberAssetRefundedEmail($heistAsset);
                $this->entityManager->persist($user);
            }

            $this->entityManager->remove($heistAsset);
        }

        $this->entityManager->flush();

        // If the asset is global, then nobody has to return the money (magic)
        if (!(null === $asset->getHeist() || $totalAmount <= 0.0)) {
            $contractor = $asset->getHeist()->getEstablishment()->getContractor();

            $contractor->setBalance($contractor->getBalance() - $totalAmount);
            $this->mailer->sendContractorAssetRefundedEmail($asset, $totalAmount);
            $this->entityManager->persist($contractor);
            $this->entityManager->flush();
        }
    }

    /**
     * @description Refund assets of a heist, when the heist is deleted
     */
    public function refundAssetsOfHeist(Heist $heist): void
    {
        $assets = $this->assetRepository->findAssetsByHeist($heist);

        foreach ($assets as $asset) {
            $totalAmount = 0.0;

            foreach ($asset->getHeistAssets() as $heistAsset) {
                $crewMember = $heistAsset->getCrewMember();

                if ($heist === $crewMember->getHeist()) {
                    $amount = $heistAsset->getTotalSpent();
                    $totalAmount += $amount;

                    $user = $crewMember->getUser();
                    $user->setBalance($user->getBalance() + $amount);

                    $this->mailer->sendCrewMemberAssetRefundedEmail($heistAsset);
                    $this->entityManager->persist($user);
                    $this->entityManager->remove($heistAsset);
                }
            }

            // If the asset is global, then nobody has to return the money (magic)
            if (!(null === $asset->getHeist() || $totalAmount <= 0.0)) {
                $contractor = $asset->getHeist()->getEstablishment()->getContractor();

                $contractor->setBalance($contractor->getBalance() - $totalAmount);
                $this->mailer->sendContractorAssetRefundedEmail($asset, $totalAmount);
                $this->entityManager->persist($contractor);
            }
        }

        $this->entityManager->flush();
    }
}
