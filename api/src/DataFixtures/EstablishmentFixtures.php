<?php

namespace App\DataFixtures;

use App\Entity\Establishment;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

final class EstablishmentFixtures extends Fixture implements DependentFixtureInterface
{
    public const ESTABLISHMENT_ROOFTOP_GARDEN = 'rooftop_garden';
    public const ESTABLISHMENT_OLD_WAREHOUSE_RED_HOOK = 'old_warehouse_red_hook';
    public const ESTABLISHMENT_CENTRAL_PARK_CAVE = 'central_park_cave';
    public const ESTABLISHMENT_BROWNSTONE_BASEMENT = 'brownstone_basement';
    public const ESTABLISHMENT_ABANDONED_INDUSTRIAL_BUILDING_LONG_ISLAND_CITY = 'abandoned_industrial_building_long_island_city';
    public const ESTABLISHMENT_PRIVATE_LIBRARY = 'private_library';
    public const ESTABLISHMENT_ABANDONED_SUBWAY_STATION = 'abandoned_subway_station';

    public const REFERENCE_IDENTIFIER = 'establishment_';
    public const DATA = [
        self::ESTABLISHMENT_ROOFTOP_GARDEN => [
            'name' => 'Rooftop Garden',
            'description' => 'A rooftop garden in the middle of the city. Perfect hideout for any heist.',
            'minimumWage' => 80000,
            'minimumWorkTimePerWeek' => 40,
            'contractor' => UserFixtures::CONTRACTOR_SHADE,
        ],
        self::ESTABLISHMENT_OLD_WAREHOUSE_RED_HOOK => [
            'name' => 'Old Warehouse, Red Hook',
            'description' => 'An old warehouse in Red Hook, Brooklyn. Extremely spacious, but also extremely cold in the winter.',
            'minimumWage' => 100000,
            'minimumWorkTimePerWeek' => 40,
            'contractor' => UserFixtures::CONTRACTOR_SHAYU,
        ],
        self::ESTABLISHMENT_CENTRAL_PARK_CAVE => [
            'name' => 'Central Park Cave',
            'description' => 'A cave in Central Park. Here, we value your safety and make sure you are well hidden.',
            'minimumWage' => 100000,
            'minimumWorkTimePerWeek' => 38,
            'contractor' => UserFixtures::CONTRACTOR_BUTCHER,
        ],
        self::ESTABLISHMENT_BROWNSTONE_BASEMENT => [
            'name' => 'Brownstone Basement',
            'description' => 'A basement in a brownstone in Brooklyn. The standard hideout for any heist.',
            'minimumWage' => 100000,
            'minimumWorkTimePerWeek' => 40,
            'contractor' => UserFixtures::CONTRACTOR_VLAD,
        ],
        self::ESTABLISHMENT_ABANDONED_INDUSTRIAL_BUILDING_LONG_ISLAND_CITY => [
            'name' => 'Abandoned Industrial Building, Long Island City',
            'description' => 'An abandoned industrial building in Long Island City. A good place to lay low.',
            'minimumWage' => 250000,
            'minimumWorkTimePerWeek' => 40,
            'contractor' => UserFixtures::CONTRACTOR_BECKETT,
        ],
        self::ESTABLISHMENT_PRIVATE_LIBRARY => [
            'name' => 'Private Library',
            'description' => 'A private library in the Upper East Side. Unsuspecting, but also very expensive. Heisters are expected to pay for any damages.',
            'minimumWage' => 100000,
            'minimumWorkTimePerWeek' => 38,
            'contractor' => UserFixtures::CONTRACTOR_MAC,
        ],
        self::ESTABLISHMENT_ABANDONED_SUBWAY_STATION => [
            'name' => 'Abandoned Subway Station',
            'description' => 'An abandoned subway station in the Lower East Side. A bad location, but it\'s free.',
            'minimumWage' => 100000,
            'minimumWorkTimePerWeek' => 40,
            'contractor' => UserFixtures::CONTRACTOR_KEEGAN,
        ],
    ];

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
        ];
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $establishment) {
            /** @var User $user */
            $user = $this->getReference(UserFixtures::REFERENCE_IDENTIFIER.$establishment['contractor'], User::class);
            $newEstablishment = (new Establishment())
                ->setName($establishment['name'])
                ->setDescription($establishment['description'])
                ->setMinimumWage($establishment['minimumWage'])
                ->setMinimumWorkTimePerWeek($establishment['minimumWorkTimePerWeek'])
                ->setContractor($user)
            ;

            $manager->persist($newEstablishment);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newEstablishment);
        }

        $manager->flush();
    }
}
