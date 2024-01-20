<?php

namespace App\DataFixtures;

use App\Entity\Employee;
use App\Entity\Establishment;
use App\Entity\Heist;
use App\Entity\Location;
use App\Enum\HeistDifficultyEnum;
use App\Enum\HeistPhaseEnum;
use App\Enum\HeistPreferedTacticEnum;
use App\Enum\HeistVisibilityEnum;
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

    // Objectives
    public const HEIST_NO_REST_FOR_THE_WICKED_OBJECTIVES = [
        [
            'name' => 'Enter the bank',
            'description' => 'Enter the bank. How you do it is up to you.',
        ],
        [
            'name' => 'Disable the security or go loud',
            'description' => 'Disable the security or secure the bank and go loud.',
        ],
        [
            'name' => 'Secure the thermite',
            'description' => 'Secure the thermite delivered by Bile.',
        ],
        [
            'name' => 'Wait for the thermite',
            'description' => 'Wait for the thermite to burn through the floor.',
        ],
        [
            'name' => 'Secure the money bags',
            'description' => 'Secure the money bags and make sure the die packs do not explode.',
        ],
        [
            'name' => 'Prepare the escape',
            'description' => 'Prepare the escape for the van by lowering the bollards.',
        ],
        [
            'name' => 'Escape',
            'description' => 'Escape with the money.',
        ],
    ];
    public const HEIST_ROAD_RAGE_OBJECTIVES = [
        [
            'name' => 'Prepare the intercept',
            'description' => 'Prepare the intercept by using the EMP device. Make sure no civilian escapes.',
        ],
        [
            'name' => 'Intercept the truck',
            'description' => 'Intercept the truck and use the device to control it.',
        ],
        [
            'name' => 'Lead the truck to the ramp',
            'description' => 'Lead the truck to the ramp by staying near it.',
        ],
        [
            'name' => 'Drill the truck',
            'description' => 'Drill below the truck to get access to the loot.',
        ],
        [
            'name' => 'Secure the loot',
            'description' => 'Lockpick the boxes and secure the loot.',
        ],
        [
            'name' => 'Escape',
            'description' => "Escape after securing the loot. Don't look back.",
        ],
    ];
    public const HEIST_DIRTY_ICE_OBJECTIVES = [
        [
            'name' => 'Enter the jewelry store',
            'description' => 'Enter the jewelry store. Preferably by entering on the roof.',
        ],
        [
            'name' => 'Disable the security',
            'description' => 'Disable the security to be able to open the display cases.',
        ],
        [
            'name' => 'Disable the cameras',
            'description' => 'Take out the cameras to avoid being detected.',
            'optional' => true,
        ],
        [
            'name' => 'Secure the jewelry',
            'description' => 'Secure the jewelry in the front and back store.',
        ],
        [
            'name' => 'Scan the jewelry',
            'description' => 'Scan the jewelry to increase their value.',
            'optional' => true,
        ],
        [
            'name' => 'Grab the big diamond',
            'description' => 'Grab the big diamond by opening the vault. You will need a red keycard and someone to press the button in the office.',
        ],
        [
            'name' => 'Secure & escape',
            'description' => 'Escape with the loot.',
        ],
    ];
    public const HEIST_ROCK_THE_CRADLE_OBJECTIVES = [
        [
            'name' => 'Enter the nightclub',
            'description' => 'Enter the nightclub. Be aware of guards.',
        ],
        [
            'name' => 'Enter the VIP area',
            'description' => 'Enter the VIP area. You have many ways to do so, VIP pass, messing with the DJ or simply stealing the blue keycard.',
        ],
        [
            'name' => 'Disable the cameras',
            'description' => 'Take out the cameras to avoid being detected.',
            'optional' => true,
        ],
        [
            'name' => 'Unlock the crypto wallet',
            'description' => 'Find a way to unlock the crypto wallet.',
        ],
        [
            'name' => 'Secure the crypto wallet',
            'description' => 'Secure the crypto wallet. DO NOT trigger the alarm.',
        ],
        [
            'name' => 'Open the vault',
            'description' => 'Open the vault to get access to more loot.',
            'optional' => true,
        ],
        [
            'name' => 'Secure the loot',
            'description' => 'Secure the loot you found in the vault and in crates.',
            'optional' => true,
        ],
        [
            'name' => 'Escape',
            'description' => 'Escape with the crypto wallet.',
        ],
    ];
    public const HEIST_UNDER_THE_SURPHAZE_OBJECTIVES = [
        [
            'name' => 'Enter the museum',
            'description' => 'Enter the museum. Try to not be detected.',
        ],
        [
            'name' => 'Disable the cameras',
            'description' => 'Immediately take out the cameras to avoid being detected.',
            'optional' => true,
        ],
        [
            'name' => 'Disable the ground floor security',
            'description' => 'Disable the ground floor security and access the first 3 exposition rooms. Those are easy to empty.',
        ],
        [
            'name' => 'Secure the ground floor paintings',
            'description' => 'Secure the ground floor paintings, along with the artifacts.',
        ],
        [
            'name' => 'Disable the first floor security',
            'description' => 'Disable the first floor security and access the next other exposition rooms. Those are harder to empty.',
        ],
        [
            'name' => 'Secure the first floor paintings',
            'description' => "Secure the first floor paintings, along with the artifacts. If you get caught by a guard or a laser, make sure to grab the client's required paintings first and rush to the roof to signal the helicopter.",
        ],
        [
            'name' => 'Secure the secret painting',
            'description' => "If you still haven't triggered the alarm, you can try to secure the secret painting by picking up the 3 required artifacts at the same time.",
            'optional' => true,
        ],
        [
            'name' => 'Escape',
            'description' => 'Escape with the required paintings, and the optional ones if you can.',
        ],
    ];
    public const HEIST_GOLD_SHARKE_OBJECTIVES = [
        [
            'name' => 'Enter the bank',
            'description' => 'Enter the bank and put everyone on the ground.',
        ],
        [
            'name' => 'Drill the first gate',
            'description' => 'Drill the first gate to get access to the vault. You could also try to find the manager and force him to open the gate.',
        ],
        [
            'name' => 'Trade the civilians',
            'description' => 'Save as much time as possible by trading the civilians and guards you captured.',
        ],
        [
            'name' => 'Find the oxygen tanks',
            'description' => 'Find the oxygen tanks early for the vault drill.',
        ],
        [
            'name' => 'Hack the vault door',
            'description' => 'Hack the vault door to get access to the vault. You may have to hack a computer to get rid of the extra security.',
        ],
        [
            'name' => 'Assemble the vault drill',
            'description' => 'Assemble the vault drill and start it.',
        ],
        [
            'name' => 'Defend the vault drill',
            'description' => 'Defend the vault drill from the cops.',
        ],
        [
            'name' => 'Empty the vault',
            'description' => 'Empty the vault and secure the gold. You must find the server we are after.',
        ],
        [
            'name' => 'Signal the helicopter',
            'description' => 'Signal the helicopter to get the gold out of the bank.',
        ],
        [
            'name' => 'Secure the server and the gold',
            'description' => 'Secure the server, and the gold if you can.',
        ],
        [
            'name' => 'Escape',
            'description' => 'Escape with the server.',
        ],
    ];
    public const HEIST_99_BOXES_OBJECTIVES = [
        [
            'name' => 'Enter the warehouse',
            'description' => 'Enter the warehouse however you want.',
        ],
        [
            'name' => 'Prepare the truck',
            'description' => 'Prepare the truck with an oxygen tank to store the components.',
        ],
        [
            'name' => 'Find the zipline',
            'description' => 'Find the zipline to get access to the cargo area.',
        ],
        [
            'name' => 'Signal the helicopter (1st component)',
            'description' => 'Signal the helicopter to deliver the thermite and open the first cargo door.',
        ],
        [
            'name' => 'Secure the first component',
            'description' => 'Secure the first component into the truck fast before it deteriorates.',
        ],
        [
            'name' => 'Signal the helicopter (2nd component)',
            'description' => 'Signal the helicopter to deliver the thermite and open the second cargo door.',
        ],
        [
            'name' => 'Secure the second component',
            'description' => 'Secure the second component into the truck fast before it deteriorates.',
        ],
        [
            'name' => 'Secure the money',
            'description' => 'Open the other cargo doors to steal the money.',
            'optional' => true,
        ],
        [
            'name' => 'Prepare the escape',
            'description' => 'Prepare the escape by placing spike strips.',
        ],
        [
            'name' => 'Escape',
            'description' => 'Escape with the components.',
        ],
    ];
    public const HEIST_TOUCH_THE_SKY_OBJECTIVES = [
        [
            'name' => 'Enter the penthouse',
            'description' => 'Enter the penthouse by the ventilation shaft (amogus). Ideally, only one should mask up and open the front door for the others.',
        ],
        [
            'name' => 'Find the master bedroom',
            'description' => 'Find the master bedroom and start hacking the door.',
        ],
        [
            'name' => 'Hack the door',
            'description' => 'Finish the hack and enter the master bedroom.',
        ],
        [
            'name' => 'Find the safe',
            'description' => 'Search for a hidden button to reveal the safe.',
        ],
        [
            'name' => 'Disable the cameras',
            'description' => 'Disable the cameras to avoid being detected.',
            'optional' => true,
        ],
        [
            'name' => "Hack the lead guard's phone",
            'description' => "Hack the lead guard's phone to get a QR code.",
        ],
        [
            'name' => 'Find the red keycard',
            'description' => 'Go into the storage room using the QR code you hacked and find the red keycard.',
        ],
        [
            'name' => 'Find and open the office',
            'description' => "Find Mason's office and open it with the red keycard.",
        ],
        [
            'name' => 'Find poison',
            'description' => 'Find poison to put in Masons drink.',
        ],
        [
            'name' => "Poison Mason's drink",
            'description' => 'Wait for the delivery guy to arrive and put poison in his drink.',
        ],
        [
            'name' => 'Get the VIP pass',
            'description' => 'Get the VIP pass from the delivery guy to avoid suspicion in the ground floor area.',
            'optional' => true,
        ],
        [
            'name' => 'Force Mason to open the vault office',
            'description' => 'Force Mason to open the vault office.',
        ],
        [
            'name' => 'Grab the codes',
            'description' => 'Grab the codes written on the whiteboard. There should also be some cocaine you can take.',
        ],
        [
            'name' => 'Open and empty the vault',
            'description' => 'Head to the master bedroom and open the vault. Empty it.',
        ],
        [
            'name' => 'Signal the helicopter',
            'description' => "If you've gone loud, signal the helicopter and set up the zipline to get the loot out.",
            'optional' => true,
        ],
        [
            'name' => 'Secure the loot & escape',
            'description' => 'Secure the loot and escape.',
        ],
    ];

    public const REFERENCE_IDENTIFIER = 'heist_';
    public const DATA = [
        // No Rest for the Wicked
        self::HEIST_NO_REST_FOR_THE_WICKED_PLANNING => [
            'name' => 'No Rest for the Wicked',
            'minimumPayout' => 100000,
            'maximumPayout' => 300000,
            'description' => 'A bank heist in the middle of the day, the most classic of all heists.',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::Normal,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            'location' => LocationFixtures::LOCATION_CHASE_BANK,
            'objectives' => self::HEIST_NO_REST_FOR_THE_WICKED_OBJECTIVES,
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
            'objectives' => self::HEIST_NO_REST_FOR_THE_WICKED_OBJECTIVES,
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
            'objectives' => self::HEIST_NO_REST_FOR_THE_WICKED_OBJECTIVES,
        ],
        // Road Rage
        self::HEIST_ROAD_RAGE_PLANNING => [
            'name' => 'Road Rage',
            'minimumPayout' => 350000,
            'maximumPayout' => 850000,
            'description' => 'Hijack a truck full of money and minerals.',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_OLD_WAREHOUSE_RED_HOOK,
            'location' => LocationFixtures::LOCATION_BROOKLYN_BRIDGE,
            'objectives' => self::HEIST_ROAD_RAGE_OBJECTIVES,
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
            'objectives' => self::HEIST_ROAD_RAGE_OBJECTIVES,
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
            'objectives' => self::HEIST_ROAD_RAGE_OBJECTIVES,
        ],
        // Dirty Ice
        self::HEIST_DIRTY_ICE_PLANNING => [
            'name' => 'Dirty Ice',
            'minimumPayout' => 80000,
            'maximumPayout' => 500000,
            'description' => 'Steal all sorts of diamonds from a jewelry store. We still do not know if we will go in loud or stealthy. Be prepared for both.',
            'preferedTactic' => HeistPreferedTacticEnum::Unknown,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_CENTRAL_PARK_CAVE,
            'location' => LocationFixtures::LOCATION_TIFFANY_AND_CO,
            'objectives' => self::HEIST_DIRTY_ICE_OBJECTIVES,
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
            'objectives' => self::HEIST_DIRTY_ICE_OBJECTIVES,
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
            'objectives' => self::HEIST_DIRTY_ICE_OBJECTIVES,
        ],
        // Rock the Cradle
        self::HEIST_ROCK_THE_CRADLE_PLANNING => [
            'name' => 'Rock the Cradle',
            'minimumPayout' => 100000,
            'maximumPayout' => 600000,
            'description' => 'Find and secure the crypto wallet from a nightclub.',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::Hard,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_BROWNSTONE_BASEMENT,
            'location' => LocationFixtures::LOCATION_MARQUEE,
            'objectives' => self::HEIST_ROCK_THE_CRADLE_OBJECTIVES,
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
            'objectives' => self::HEIST_ROCK_THE_CRADLE_OBJECTIVES,
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
            'objectives' => self::HEIST_ROCK_THE_CRADLE_OBJECTIVES,
        ],
        // Under the Surphaze
        self::HEIST_UNDER_THE_SURPHAZE_PLANNING => [
            'name' => 'Under the Surphaze',
            'minimumPayout' => 500000,
            'maximumPayout' => 950000,
            'description' => 'Infiltrate the modern art museum and steal the most expensive paintings. My client will not tolerate any damage to the paintings.',
            'preferedTactic' => HeistPreferedTacticEnum::SemiStealth,
            'difficulty' => HeistDifficultyEnum::Hard,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_INDUSTRIAL_BUILDING_LONG_ISLAND_CITY,
            'location' => LocationFixtures::LOCATION_MUSEUM_OF_MODERN_ART,
            'objectives' => self::HEIST_UNDER_THE_SURPHAZE_OBJECTIVES,
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
            'objectives' => self::HEIST_UNDER_THE_SURPHAZE_OBJECTIVES,
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
            'objectives' => self::HEIST_UNDER_THE_SURPHAZE_OBJECTIVES,
        ],
        // Gold & Sharke
        self::HEIST_GOLD_SHARKE_PLANNING => [
            'name' => 'Gold & Sharke',
            'minimumPayout' => 600000,
            'maximumPayout' => 1000000,
            'description' => 'Steal the gold from the bank vault. The bank is in the middle of the city, so be prepared for a lot of cops.',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::VeryHard,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            'location' => LocationFixtures::LOCATION_BANK_AMERICA_TOWER,
            'objectives' => self::HEIST_GOLD_SHARKE_OBJECTIVES,
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
            'location' => LocationFixtures::LOCATION_BANK_AMERICA_TOWER,
            'objectives' => self::HEIST_GOLD_SHARKE_OBJECTIVES,
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
            'location' => LocationFixtures::LOCATION_BANK_AMERICA_TOWER,
            'objectives' => self::HEIST_GOLD_SHARKE_OBJECTIVES,
        ],
        // 99 Boxes
        self::HEIST_99_BOXES_PLANNING => [
            'name' => '99 Boxes',
            'minimumPayout' => 450000,
            'maximumPayout' => 900000,
            'description' => 'A warehouse full of boxes. You need to secure the components fast before they deteriorate.',
            'preferedTactic' => HeistPreferedTacticEnum::Loud,
            'difficulty' => HeistDifficultyEnum::VeryHard,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_PRIVATE_LIBRARY,
            'location' => LocationFixtures::LOCATION_RED_HOOK_TERMINAL,
            'objectives' => self::HEIST_99_BOXES_OBJECTIVES,
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
            'objectives' => self::HEIST_99_BOXES_OBJECTIVES,
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
            'objectives' => self::HEIST_99_BOXES_OBJECTIVES,
        ],
        // Touch the Sky
        self::HEIST_TOUCH_THE_SKY_PLANNING => [
            'name' => 'Touch the Sky',
            'minimumPayout' => 350000,
            'maximumPayout' => 1000000,
            'description' => 'A fancy penthouse next to the water. The owner is a rich guy who is not afraid to use his money to get what he wants.',
            'preferedTactic' => HeistPreferedTacticEnum::Stealth,
            'difficulty' => HeistDifficultyEnum::Overkill,
            'phase' => HeistPhaseEnum::Planning,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_SUBWAY_STATION,
            'location' => LocationFixtures::LOCATION_ONE57,
            'objectives' => self::HEIST_TOUCH_THE_SKY_OBJECTIVES,
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
            'objectives' => self::HEIST_TOUCH_THE_SKY_OBJECTIVES,
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
            'objectives' => self::HEIST_TOUCH_THE_SKY_OBJECTIVES,
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

            $visibility = HeistVisibilityEnum::Draft;

            if (null !== $employee) {
                /** @var Employee $employee */
                $employee = $this->getReference(EmployeeFixtures::REFERENCE_IDENTIFIER.$heist['employee'], Employee::class);
                $visibility = HeistVisibilityEnum::Public;
            }

            $startAt = $heist['startAt'] ?? (new \DateTime())->format('Y-m-d G:i:s');
            $shouldEndAt = $heist['shouldEndAt'] ?? (new \DateTime())->modify('+2 hours')->format('Y-m-d G:i:s');

            $newHeist = (new Heist())
                ->setName($heist['name'])
                ->setMinimumPayout($heist['minimumPayout'])
                ->setMaximumPayout($heist['maximumPayout'])
                ->setDescription($heist['description'] ?? null)
                ->setStartAt(\DateTime::createFromFormat('Y-m-d G:i:s', $startAt))
                ->setShouldEndAt(\DateTime::createFromFormat('Y-m-d G:i:s', $shouldEndAt))
                ->setEndedAt($endedAt ? \DateTime::createFromFormat('Y-m-d G:i:s', $heist['endedAt']) : null)
                ->setPreferedTactic($heist['preferedTactic'])
                ->setDifficulty($heist['difficulty'])
                ->setPhase($heist['phase'])
                ->setEstablishment($establishment)
                ->setEmployee($employee)
                ->setLocation($location)
                ->setVisibility($visibility)
                ->setObjectives($heist['objectives'])
            ;

            $manager->persist($newHeist);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newHeist);
        }

        $manager->flush();
    }
}
