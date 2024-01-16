<?php

namespace App\DataFixtures;

use App\Entity\Asset;
use App\Entity\CrewMember;
use App\Entity\HeistAsset;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

final class HeistAssetFixtures extends Fixture implements DependentFixtureInterface
{
    public const DALLAS_MEDIC_BAG = 'dallas_medic_bag';

    public const REFERENCE_IDENTIFIER = 'heist-asset_';

    public function getDependencies(): array
    {
        return [
            AssetFixtures::class,
            CrewMemberFixtures::class,
        ];
    }

    public function load(ObjectManager $manager): void
    {
        // Mr. Dallas buys a medic bag
        $dallas = $this->getReference(CrewMemberFixtures::REFERENCE_IDENTIFIER.'0', CrewMember::class);
        $asset = $this->getReference(AssetFixtures::REFERENCE_IDENTIFIER.AssetFixtures::GLOBAL_ASSET_MEDIC_BAG, Asset::class);

        $heistAsset = (new HeistAsset())
            ->setAsset($asset)
            ->setCrewMember($dallas)
            ->setQuantity(1)
            ->setTotalSpent($asset->getPrice())
        ;

        $manager->persist($heistAsset);
        $this->addReference(self::REFERENCE_IDENTIFIER.self::DALLAS_MEDIC_BAG, $heistAsset);

        foreach (array_keys(CrewMemberFixtures::DATA) as $key) {
            /** @var Asset $randomAsset */
            $randomAsset = $this->getReference(AssetFixtures::REFERENCE_IDENTIFIER.array_rand(AssetFixtures::DATA), Asset::class);
            /** @var CrewMember $crewMember */
            $crewMember = $this->getReference(CrewMemberFixtures::REFERENCE_IDENTIFIER.$key, CrewMember::class);
            $quantity = random_int(1, $randomAsset->getMaxQuantity() ?? 1);
            $newHeistAsset = (new HeistAsset())
                ->setAsset($randomAsset)
                ->setCrewMember($crewMember)
                ->setQuantity($quantity)
                ->setTotalSpent($quantity * $randomAsset->getPrice())
            ;

            $manager->persist($newHeistAsset);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newHeistAsset);
        }

        $manager->flush();
    }
}
