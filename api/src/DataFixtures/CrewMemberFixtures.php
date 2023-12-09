<?php

namespace App\DataFixtures;

use App\Entity\CrewMember;
use App\Entity\Heist;
use App\Entity\User;
use App\Enum\CrewMemberStatusEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

final class CrewMemberFixtures extends Fixture implements DependentFixtureInterface
{
    public const REFERENCE_IDENTIFIER = 'crew_member_';
    public const DATA = [
        // No Rest for the Wicked
        // Success
        [
            'civilianCasualties' => 0,
            'kills' => 85,
            'objectivesCompleted' => 7,
            'payout' => 200000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_DALLAS,
            'heist' => HeistFixtures::HEIST_NO_REST_FOR_THE_WICKED_SUCCESS,
        ],
        [
            'civilianCasualties' => 0,
            'kills' => 50,
            'objectivesCompleted' => 7,
            'payout' => 200000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_JOY,
            'heist' => HeistFixtures::HEIST_NO_REST_FOR_THE_WICKED_SUCCESS,
        ],
        [
            'civilianCasualties' => 0,
            'kills' => 62,
            'objectivesCompleted' => 7,
            'payout' => 200000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_CHAINS,
            'heist' => HeistFixtures::HEIST_NO_REST_FOR_THE_WICKED_SUCCESS,
        ],
        // Failure
        [
            'civilianCasualties' => 2,
            'kills' => 26,
            'objectivesCompleted' => 1,
            'status' => CrewMemberStatusEnum::Jailed,
            'user' => UserFixtures::HEISTER_WOLF,
            'heist' => HeistFixtures::HEIST_NO_REST_FOR_THE_WICKED_FAILED,
        ],
        // Road Rage
        // Success
        [
            'civilianCasualties' => 0,
            'kills' => 102,
            'objectivesCompleted' => 6,
            'payout' => 750000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_DALLAS,
            'heist' => HeistFixtures::HEIST_ROAD_RAGE_SUCCESS,
        ],
        [
            'civilianCasualties' => 0,
            'kills' => 146,
            'objectivesCompleted' => 6,
            'payout' => 750000,
            'status' => CrewMemberStatusEnum::Jailed,
            'user' => UserFixtures::HEISTER_HOXTON,
            'heist' => HeistFixtures::HEIST_ROAD_RAGE_SUCCESS,
        ],
        // Failure
        [
            'civilianCasualties' => 1,
            'kills' => 4,
            'objectivesCompleted' => 0,
            'status' => CrewMemberStatusEnum::Jailed,
            'user' => UserFixtures::HEISTER_JOY,
            'heist' => HeistFixtures::HEIST_ROAD_RAGE_FAILED,
        ],
        // Dirty Ice
        // Success
        [
            'civilianCasualties' => 0,
            'kills' => 0,
            'objectivesCompleted' => 5,
            'payout' => 500000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_HOXTON,
            'heist' => HeistFixtures::HEIST_DIRTY_ICE_SUCCESS,
        ],
        [
            'civilianCasualties' => 0,
            'kills' => 0,
            'objectivesCompleted' => 7,
            'payout' => 500000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_PEARL,
            'heist' => HeistFixtures::HEIST_DIRTY_ICE_SUCCESS,
        ],
        // Failure
        [
            'civilianCasualties' => 0,
            'kills' => 2,
            'objectivesCompleted' => 0,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_JOY,
            'heist' => HeistFixtures::HEIST_DIRTY_ICE_FAILED,
        ],
        [
            'civilianCasualties' => 0,
            'kills' => 0,
            'objectivesCompleted' => 1,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_DALLAS,
            'heist' => HeistFixtures::HEIST_DIRTY_ICE_FAILED,
        ],
        [
            'civilianCasualties' => 0,
            'kills' => 0,
            'objectivesCompleted' => 1,
            'status' => CrewMemberStatusEnum::Jailed,
            'user' => UserFixtures::HEISTER_WOLF,
            'heist' => HeistFixtures::HEIST_DIRTY_ICE_FAILED,
        ],
        // Rock the Cradle
        // Success
        [
            'civilianCasualties' => 4,
            'kills' => 223,
            'objectivesCompleted' => 7,
            'payout' => 550000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_HOXTON,
            'heist' => HeistFixtures::HEIST_ROCK_THE_CRADLE_SUCCESS,
        ],
        // Failure
        [
            'civilianCasualties' => 22,
            'kills' => 7,
            'objectivesCompleted' => 2,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_WOLF,
            'heist' => HeistFixtures::HEIST_ROCK_THE_CRADLE_FAILED,
        ],
        // Under the Surphaze
        // Success
        [
            'civilianCasualties' => 0,
            'kills' => 32,
            'objectivesCompleted' => 6,
            'payout' => 950000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_JOY,
            'heist' => HeistFixtures::HEIST_UNDER_THE_SURPHAZE_SUCCESS,
        ],
        [
            'civilianCasualties' => 0,
            'kills' => 24,
            'objectivesCompleted' => 6,
            'payout' => 950000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_WOLF,
            'heist' => HeistFixtures::HEIST_UNDER_THE_SURPHAZE_SUCCESS,
        ],
        // Failure
        [
            'civilianCasualties' => 0,
            'kills' => 57,
            'objectivesCompleted' => 2,
            'status' => CrewMemberStatusEnum::Dead,
            'user' => UserFixtures::HEISTER_HOXTON,
            'heist' => HeistFixtures::HEIST_UNDER_THE_SURPHAZE_FAILED,
        ],
        // Gold & Sharke
        // Success
        [
            'civilianCasualties' => 0,
            'kills' => 474,
            'objectivesCompleted' => 11,
            'payout' => 650000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_DALLAS,
            'heist' => HeistFixtures::HEIST_GOLD_SHARKE_SUCCESS,
        ],
        // Failure
        [
            'civilianCasualties' => 0,
            'kills' => 65,
            'objectivesCompleted' => 2,
            'status' => CrewMemberStatusEnum::Jailed,
            'user' => UserFixtures::HEISTER_CHAINS,
            'heist' => HeistFixtures::HEIST_GOLD_SHARKE_FAILED,
        ],
        // 99 Boxes
        // Success
        [
            'civilianCasualties' => 0,
            'kills' => 74,
            'objectivesCompleted' => 9,
            'payout' => 650000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_WOLF,
            'heist' => HeistFixtures::HEIST_99_BOXES_SUCCESS,
        ],
        // Failure
        [
            'civilianCasualties' => 1,
            'kills' => 82,
            'objectivesCompleted' => 3,
            'status' => CrewMemberStatusEnum::Jailed,
            'user' => UserFixtures::HEISTER_JOY,
            'heist' => HeistFixtures::HEIST_99_BOXES_FAILED,
        ],
        // Touch the Sky
        // Success
        [
            'civilianCasualties' => 1,
            'kills' => 274,
            'objectivesCompleted' => 14,
            'payout' => 1000000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_HOXTON,
            'heist' => HeistFixtures::HEIST_TOUCH_THE_SKY_SUCCESS,
        ],
        [
            'civilianCasualties' => 0,
            'kills' => 302,
            'objectivesCompleted' => 16,
            'payout' => 1000000,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_DALLAS,
            'heist' => HeistFixtures::HEIST_TOUCH_THE_SKY_SUCCESS,
        ],
        // Failure
        [
            'civilianCasualties' => 0,
            'kills' => 235,
            'objectivesCompleted' => 5,
            'status' => CrewMemberStatusEnum::Free,
            'user' => UserFixtures::HEISTER_PEARL,
            'heist' => HeistFixtures::HEIST_TOUCH_THE_SKY_FAILED,
        ],
    ];

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            HeistFixtures::class,
        ];
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $crewMember) {
            /** @var User $user */
            $user = $this->getReference(UserFixtures::REFERENCE_IDENTIFIER.$crewMember['user'], User::class);
            /** @var Heist $heist */
            $heist = $this->getReference(HeistFixtures::REFERENCE_IDENTIFIER.$crewMember['heist'], Heist::class);

            $newCrewMember = (new CrewMember())
                ->setCivilianCasualties($crewMember['civilianCasualties'])
                ->setKills($crewMember['kills'])
                ->setObjectivesCompleted($crewMember['objectivesCompleted'])
                ->setPayout($crewMember['payout'] ?? 0.0)
                ->setStatus($crewMember['status'])
                ->setUser($user)
                ->setHeist($heist)
            ;

            $manager->persist($newCrewMember);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newCrewMember);
        }

        $manager->flush();
    }
}
