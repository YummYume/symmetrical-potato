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
        foreach (array_keys(CrewMemberFixtures::DATA) as $key) {
            /** @var Asset $randomAsset */
            $randomAsset = $this->getReference(AssetFixtures::REFERENCE_IDENTIFIER.array_rand(AssetFixtures::DATA), Asset::class);
            /** @var CrewMember $crewMember */
            $crewMember = $this->getReference(CrewMemberFixtures::REFERENCE_IDENTIFIER.$key, CrewMember::class);
            $newHeistAsset = (new HeistAsset())
                ->setAsset($randomAsset)
                ->setCrewMember($crewMember)
                ->setQuantity(random_int(1, $randomAsset->getMaxQuantity()))
            ;

            $manager->persist($newHeistAsset);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newHeistAsset);
        }

        $manager->flush();
    }
}
