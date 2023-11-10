<?php

namespace App\DataFixtures;

use App\Entity\Employee;
use App\Entity\Establishment;
use App\Entity\Heist;
use App\Entity\Location;
use App\Enum\HeistDifficultyEnum;
use App\Enum\HeistPhaseEnum;
use App\Enum\HeistPreferedTacticEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

final class HeistFixtures extends Fixture implements DependentFixtureInterface
{
    // No Rest for the Wicked
    public const HEIST_NO_REST_FOR_THE_WICKED_PLANNING = 'no_rest_for_the_wicked_planning';
    public const HEIST_NO_REST_FOR_THE_WICKED_SUCCESS = 'no_rest_for_the_wicked_success';
    public const HEIST_NO_REST_FOR_THE_WICKED_FAILED = 'no_rest_for_the_wicked_failed';
    // Road Rage
    public const HEIST_ROAD_RAGE_PLANNING = 'road_rage_planning';
    public const HEIST_ROAD_RAGE_SUCCESS = 'road_rage_success';
    public const HEIST_ROAD_RAGE_FAILED = 'road_rage_failed';
    // Dirty Ice
    public const HEIST_DIRTY_ICE_PLANNING = 'dirty_ice_planning';
    public const HEIST_DIRTY_ICE_SUCCESS = 'dirty_ice_success';
    public const HEIST_DIRTY_ICE_FAILED = 'dirty_ice_failed';
    // Rock the Cradle
    public const HEIST_ROCK_THE_CRADLE_PLANNING = 'rock_the_cradle_planning';
    public const HEIST_ROCK_THE_CRADLE_SUCCESS = 'rock_the_cradle_success';
    public const HEIST_ROCK_THE_CRADLE_FAILED = 'rock_the_cradle_failed';
    // Under the Surphaze
    public const HEIST_UNDER_THE_SURPHAZE_PLANNING = 'under_the_surphaze_planning';
    public const HEIST_UNDER_THE_SURPHAZE_SUCCESS = 'under_the_surphaze_success';
    public const HEIST_UNDER_THE_SURPHAZE_FAILED = 'under_the_surphaze_failed';
    // Gold Sharke
    public const HEIST_GOLD_SHARKE_PLANNING = 'gold_sharke_planning';
    public const HEIST_GOLD_SHARKE_SUCCESS = 'gold_sharke_success';
    public const HEIST_GOLD_SHARKE_FAILED = 'gold_sharke_failed';
    // 99 Boxes
    public const HEIST_99_BOXES_PLANNING = '99_boxes_planning';
    public const HEIST_99_BOXES_SUCCESS = '99_boxes_success';
    public const HEIST_99_BOXES_FAILED = '99_boxes_failed';
    // Touch the Sky
    public const HEIST_TOUCH_THE_SKY_PLANNING = 'touch_the_sky_planning';
    public const HEIST_TOUCH_THE_SKY_SUCCESS = 'touch_the_sky_success';
    public const HEIST_TOUCH_THE_SKY_FAILED = 'touch_the_sky_failed';

    public const REFERENCE_IDENTIFIER = 'heist_';
    public const DATA = [
        // No Rest for the Wicked
        self::HEIST_NO_REST_FOR_THE_WICKED_PLANNING => [
            'name' => 'No Rest for the Wicked',
            'minimumPayout' => 100000,
            'maximumPayout' => 300000,
            'description' => 'A bank heist in the middle of the day, the most classic of all heists.',
            'startAt' => '2024-01-01 14:00:00',
            'shouldEndAt' => '2024-01-01 16:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::Normal,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            'location' => LocationFixtures::LOCATION_CHASE_BANK,
        ],
        self::HEIST_NO_REST_FOR_THE_WICKED_SUCCESS => [
            'name' => 'No Rest for the Wicked',
            'minimumPayout' => 100000,
            'maximumPayout' => 300000,
            'description' => 'A bank heist in the middle of the day, the most classic of all heists.',
            'startAt' => '2023-09-07 14:00:00',
            'shouldEndAt' => '2023-09-07 16:00:00',
            'endedAt' => '2023-09-07 15:30:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::Normal,
            'phase' => HeistPhaseEnum::Succeeded,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            'employee' => UserFixtures::EMPLOYEE_BILE,
            'location' => LocationFixtures::LOCATION_CHASE_BANK,
        ],
        self::HEIST_NO_REST_FOR_THE_WICKED_FAILED => [
            'name' => 'No Rest for the Wicked',
            'minimumPayout' => 100000,
            'maximumPayout' => 300000,
            'description' => 'A bank heist in the middle of the day, the most classic of all heists.',
            'startAt' => '2023-09-21 14:00:00',
            'shouldEndAt' => '2023-09-21 16:00:00',
            'endedAt' => '2023-09-21 15:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::Normal,
            'phase' => HeistPhaseEnum::Failed,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            'employee' => UserFixtures::EMPLOYEE_BILE,
            'location' => LocationFixtures::LOCATION_CHASE_BANK,
        ],
        // Road Rage
        self::HEIST_ROAD_RAGE_PLANNING => [
            'name' => 'Road Rage',
            'minimumPayout' => 350000,
            'maximumPayout' => 850000,
            'description' => 'Hijack a truck full of money and minerals.',
            'startAt' => '2024-01-01 10:00:00',
            'shouldEndAt' => '2024-01-01 11:15:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_OLD_WAREHOUSE_RED_HOOK,
            'location' => LocationFixtures::LOCATION_BROOKLYN_BRIDGE,
        ],
        self::HEIST_ROAD_RAGE_SUCCESS => [
            'name' => 'Road Rage',
            'minimumPayout' => 350000,
            'maximumPayout' => 850000,
            'description' => 'Hijack a truck full of money and minerals.',
            'startAt' => '2023-10-02 14:00:00',
            'shouldEndAt' => '2023-10-02 16:00:00',
            'endedAt' => '2023-10-02 15:30:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Succeeded,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_OLD_WAREHOUSE_RED_HOOK,
            'employee' => UserFixtures::EMPLOYEE_BOB,
            'location' => LocationFixtures::LOCATION_BROOKLYN_BRIDGE,
        ],
        self::HEIST_ROAD_RAGE_FAILED => [
            'name' => 'Road Rage',
            'minimumPayout' => 350000,
            'maximumPayout' => 850000,
            'description' => 'Hijack a truck full of money and minerals.',
            'startAt' => '2023-10-03 14:00:00',
            'shouldEndAt' => '2023-10-03 16:00:00',
            'endedAt' => '2023-10-03 14:30:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Failed,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_OLD_WAREHOUSE_RED_HOOK,
            'employee' => UserFixtures::EMPLOYEE_BOB,
            'location' => LocationFixtures::LOCATION_BROOKLYN_BRIDGE,
        ],
        // Dirty Ice
        self::HEIST_DIRTY_ICE_PLANNING => [
            'name' => 'Dirty Ice',
            'minimumPayout' => 80000,
            'maximumPayout' => 500000,
            'description' => 'Steal all sorts of diamonds from a jewelry store. We still do not know if we will go in loud or stealthy. Be prepared for both.',
            'startAt' => '2024-01-01 10:00:00',
            'shouldEndAt' => '2024-01-01 11:15:00',
            'preferedTactic' => HeistPreferedTacticEnum::Unknown,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_CENTRAL_PARK_CAVE,
            'location' => LocationFixtures::LOCATION_TIFFANY_AND_CO,
        ],
        self::HEIST_DIRTY_ICE_SUCCESS => [
            'name' => 'Dirty Ice',
            'minimumPayout' => 80000,
            'maximumPayout' => 500000,
            'description' => 'Steal all sorts of diamonds from a jewelry store.',
            'startAt' => '2023-10-02 09:00:00',
            'shouldEndAt' => '2023-10-02 11:00:00',
            'endedAt' => '2023-10-02 10:46:00',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Succeeded,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_CENTRAL_PARK_CAVE,
            'employee' => UserFixtures::EMPLOYEE_INFILTRATED_CIVILIAN,
            'location' => LocationFixtures::LOCATION_TIFFANY_AND_CO,
        ],
        self::HEIST_DIRTY_ICE_FAILED => [
            'name' => 'Dirty Ice',
            'minimumPayout' => 80000,
            'maximumPayout' => 500000,
            'description' => 'Steal all sorts of diamonds from a jewelry store.',
            'startAt' => '2023-10-02 14:00:00',
            'shouldEndAt' => '2023-10-02 16:00:00',
            'endedAt' => '2023-10-02 14:27:00',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Failed,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_CENTRAL_PARK_CAVE,
            'employee' => UserFixtures::EMPLOYEE_INFILTRATED_CIVILIAN,
            'location' => LocationFixtures::LOCATION_TIFFANY_AND_CO,
        ],
        // Rock the Cradle
        self::HEIST_ROCK_THE_CRADLE_PLANNING => [
            'name' => 'Rock the Cradle',
            'minimumPayout' => 100000,
            'maximumPayout' => 600000,
            'description' => 'Find and secure the crypto wallet from a nightclub.',
            'startAt' => '2023-11-03 22:00:00',
            'shouldEndAt' => '2023-11-03 23:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::Hard,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_BROWNSTONE_BASEMENT,
            'location' => LocationFixtures::LOCATION_MARQUEE,
        ],
        self::HEIST_ROCK_THE_CRADLE_SUCCESS => [
            'name' => 'Rock the Cradle',
            'minimumPayout' => 100000,
            'maximumPayout' => 600000,
            'description' => 'Find and secure the crypto wallet from a nightclub.',
            'startAt' => '2023-07-06 22:00:00',
            'shouldEndAt' => '2023-07-06 23:00:00',
            'endedAt' => '2023-07-06 22:45:00',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::Hard,
            'phase' => HeistPhaseEnum::Succeeded,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_BROWNSTONE_BASEMENT,
            'employee' => UserFixtures::EMPLOYEE_FAKE_COP,
            'location' => LocationFixtures::LOCATION_MARQUEE,
        ],
        self::HEIST_ROCK_THE_CRADLE_FAILED => [
            'name' => 'Rock the Cradle',
            'minimumPayout' => 100000,
            'maximumPayout' => 600000,
            'description' => 'Find and secure the crypto wallet from a nightclub.',
            'startAt' => '2023-07-07 22:00:00',
            'shouldEndAt' => '2023-07-07 23:00:00',
            'endedAt' => '2023-07-07 22:30:00',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::Hard,
            'phase' => HeistPhaseEnum::Failed,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_BROWNSTONE_BASEMENT,
            'employee' => UserFixtures::EMPLOYEE_FAKE_COP,
            'location' => LocationFixtures::LOCATION_MARQUEE,
        ],
        // Under the Surphaze
        self::HEIST_UNDER_THE_SURPHAZE_PLANNING => [
            'name' => 'Under the Surphaze',
            'minimumPayout' => 500000,
            'maximumPayout' => 950000,
            'description' => 'Infiltrate the modern art museum and steal the most expensive paintings. My client will not tolerate any damage to the paintings.',
            'startAt' => '2023-11-03 15:00:00',
            'shouldEndAt' => '2023-11-03 17:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::SemiStealth,
            'difficulty' => HeistDifficultyEnum::Hard,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_INDUSTRIAL_BUILDING_LONG_ISLAND_CITY,
            'location' => LocationFixtures::LOCATION_MUSEUM_OF_MODERN_ART,
        ],
        self::HEIST_UNDER_THE_SURPHAZE_SUCCESS => [
            'name' => 'Under the Surphaze',
            'minimumPayout' => 500000,
            'maximumPayout' => 950000,
            'description' => 'Infiltrate the modern art museum and steal the most expensive paintings. My client will not tolerate any damage to the paintings.',
            'startAt' => '2023-07-06 15:00:00',
            'shouldEndAt' => '2023-07-06 17:00:00',
            'endedAt' => '2023-07-06 16:30:00',
            'preferedTactic' => HeistPreferedTacticEnum::SemiStealth,
            'difficulty' => HeistDifficultyEnum::Hard,
            'phase' => HeistPhaseEnum::Succeeded,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_INDUSTRIAL_BUILDING_LONG_ISLAND_CITY,
            'employee' => UserFixtures::EMPLOYEE_FAKE_GUARD,
            'location' => LocationFixtures::LOCATION_MUSEUM_OF_MODERN_ART,
        ],
        self::HEIST_UNDER_THE_SURPHAZE_FAILED => [
            'name' => 'Under the Surphaze',
            'minimumPayout' => 500000,
            'maximumPayout' => 950000,
            'description' => 'Infiltrate the modern art museum and steal the most expensive paintings. My client will not tolerate any damage to the paintings.',
            'startAt' => '2023-07-01 15:00:00',
            'shouldEndAt' => '2023-07-01 17:00:00',
            'endedAt' => '2023-07-01 16:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::SemiStealth,
            'difficulty' => HeistDifficultyEnum::Hard,
            'phase' => HeistPhaseEnum::Failed,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_INDUSTRIAL_BUILDING_LONG_ISLAND_CITY,
            'employee' => UserFixtures::EMPLOYEE_FAKE_GUARD,
            'location' => LocationFixtures::LOCATION_MUSEUM_OF_MODERN_ART,
        ],
        // Gold & Sharke
        self::HEIST_GOLD_SHARKE_PLANNING => [
            'name' => 'Gold & Sharke',
            'minimumPayout' => 600000,
            'maximumPayout' => 1000000,
            'description' => 'Steal the gold from the bank vault. The bank is in the middle of the city, so be prepared for a lot of cops.',
            'startAt' => '2023-11-03 15:00:00',
            'shouldEndAt' => '2023-11-03 17:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::VeryHard,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            'location' => LocationFixtures::LOCATION_BDIPLUS,
        ],
        self::HEIST_GOLD_SHARKE_SUCCESS => [
            'name' => 'Gold & Sharke',
            'minimumPayout' => 600000,
            'maximumPayout' => 1000000,
            'description' => 'Steal the gold from the bank vault. The bank is in the middle of the city, so be prepared for a lot of cops.',
            'startAt' => '2023-07-06 15:00:00',
            'shouldEndAt' => '2023-07-06 17:00:00',
            'endedAt' => '2023-07-06 16:30:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::VeryHard,
            'phase' => HeistPhaseEnum::Succeeded,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            'employee' => UserFixtures::EMPLOYEE_BILE,
            'location' => LocationFixtures::LOCATION_BDIPLUS,
        ],
        self::HEIST_GOLD_SHARKE_FAILED => [
            'name' => 'Gold & Sharke',
            'minimumPayout' => 600000,
            'maximumPayout' => 1000000,
            'description' => 'Steal the gold from the bank vault. The bank is in the middle of the city, so be prepared for a lot of cops.',
            'startAt' => '2023-07-01 15:00:00',
            'shouldEndAt' => '2023-07-01 17:00:00',
            'endedAt' => '2023-07-01 16:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::VeryHard,
            'phase' => HeistPhaseEnum::Failed,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            'employee' => UserFixtures::EMPLOYEE_BILE,
            'location' => LocationFixtures::LOCATION_BDIPLUS,
        ],
        // 99 Boxes
        self::HEIST_99_BOXES_PLANNING => [
            'name' => '99 Boxes',
            'minimumPayout' => 450000,
            'maximumPayout' => 900000,
            'description' => 'A warehouse full of boxes. You need to secure the components fast before they deteriorate.',
            'startAt' => '2023-11-03 15:00:00',
            'shouldEndAt' => '2023-11-03 17:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::VeryHard,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_PRIVATE_LIBRARY,
            'location' => LocationFixtures::LOCATION_RED_HOOK_TERMINAL,
        ],
        self::HEIST_99_BOXES_SUCCESS => [
            'name' => '99 Boxes',
            'minimumPayout' => 450000,
            'maximumPayout' => 900000,
            'description' => 'A warehouse full of boxes. You need to secure the components fast before they deteriorate.',
            'startAt' => '2023-07-06 15:00:00',
            'shouldEndAt' => '2023-07-06 17:00:00',
            'endedAt' => '2023-07-06 16:30:00',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::VeryHard,
            'phase' => HeistPhaseEnum::Succeeded,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_PRIVATE_LIBRARY,
            'employee' => UserFixtures::EMPLOYEE_POLLING_MAN,
            'location' => LocationFixtures::LOCATION_RED_HOOK_TERMINAL,
        ],
        self::HEIST_99_BOXES_FAILED => [
            'name' => '99 Boxes',
            'minimumPayout' => 450000,
            'maximumPayout' => 900000,
            'description' => 'A warehouse full of boxes. You need to secure the components fast before they deteriorate.',
            'startAt' => '2023-07-01 15:00:00',
            'shouldEndAt' => '2023-07-01 17:00:00',
            'endedAt' => '2023-07-01 16:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::VeryHard,
            'phase' => HeistPhaseEnum::Failed,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_PRIVATE_LIBRARY,
            'employee' => UserFixtures::EMPLOYEE_POLLING_MAN,
            'location' => LocationFixtures::LOCATION_RED_HOOK_TERMINAL,
        ],
        // Touch the Sky
        self::HEIST_TOUCH_THE_SKY_PLANNING => [
            'name' => 'Touch the Sky',
            'minimumPayout' => 350000,
            'maximumPayout' => 1000000,
            'description' => 'A fancy penthouse next to the water. The owner is a rich guy who is not afraid to use his money to get what he wants.',
            'startAt' => '2023-11-03 15:00:00',
            'shouldEndAt' => '2023-11-03 17:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_SUBWAY_STATION,
            'location' => LocationFixtures::LOCATION_ONE57,
        ],
        self::HEIST_TOUCH_THE_SKY_SUCCESS => [
            'name' => 'Touch the Sky',
            'minimumPayout' => 350000,
            'maximumPayout' => 1000000,
            'description' => 'A fancy penthouse next to the water. The owner is a rich guy who is not afraid to use his money to get what he wants.',
            'startAt' => '2023-01-25 15:00:00',
            'shouldEndAt' => '2023-01-25 17:00:00',
            'endedAt' => '2023-01-25 16:30:00',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Succeeded,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_SUBWAY_STATION,
            'employee' => UserFixtures::EMPLOYEE_GANG_MEMBER,
            'location' => LocationFixtures::LOCATION_ONE57,
        ],
        self::HEIST_TOUCH_THE_SKY_FAILED => [
            'name' => 'Touch the Sky',
            'minimumPayout' => 350000,
            'maximumPayout' => 1000000,
            'description' => 'A fancy penthouse next to the water. The owner is a rich guy who is not afraid to use his money to get what he wants.',
            'startAt' => '2023-03-16 15:00:00',
            'shouldEndAt' => '2023-03-16 17:00:00',
            'endedAt' => '2023-03-16 16:00:00',
            'preferedTactic' => HeistPreferedTacticEnum::SemiStealth,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Failed,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_SUBWAY_STATION,
            'employee' => UserFixtures::EMPLOYEE_GANG_MEMBER,
            'location' => LocationFixtures::LOCATION_ONE57,
        ],
    ];

    public function getDependencies(): array
    {
        return [
            EstablishmentFixtures::class,
            LocationFixtures::class,
            EmployeeFixtures::class,
        ];
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $heist) {
            $employee = $heist['employee'] ?? null;
            /** @var Establishment $establishment */
            $establishment = $this->getReference(EstablishmentFixtures::REFERENCE_IDENTIFIER.$heist['establishment'], Establishment::class);
            /** @var Location $location */
            $location = $this->getReference(LocationFixtures::REFERENCE_IDENTIFIER.$heist['location'], Location::class);
            $endedAt = $heist['endedAt'] ?? null;

            if (null !== $employee) {
                /** @var Employee $employee */
                $employee = $this->getReference(EmployeeFixtures::REFERENCE_IDENTIFIER.$heist['employee'], Employee::class);
            }

            $newHeist = (new Heist())
                ->setName($heist['name'])
                ->setMinimumPayout($heist['minimumPayout'])
                ->setMaximumPayout($heist['maximumPayout'])
                ->setDescription($heist['description'] ?? null)
                ->setStartAt(\DateTime::createFromFormat('Y-m-d G:i:s', $heist['startAt']))
                ->setShouldEndAt(\DateTime::createFromFormat('Y-m-d G:i:s', $heist['shouldEndAt']))
                ->setEndedAt($endedAt ? \DateTime::createFromFormat('Y-m-d G:i:s', $heist['endedAt']) : null)
                ->setPreferedTactic($heist['preferedTactic'])
                ->setDifficulty($heist['difficulty'])
                ->setPhase($heist['phase'])
                ->setEstablishment($establishment)
                ->setEmployee($employee)
                ->setLocation($location)
            ;

            $manager->persist($newHeist);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newHeist);
        }

        $manager->flush();
    }
}
