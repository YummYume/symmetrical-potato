<?php

namespace App\DataFixtures;

use App\Entity\Location;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

final class LocationFixtures extends Fixture
{
    public const LOCATION_CHASE_BANK = 'chase_bank';
    public const LOCATION_BROOKLYN_BRIDGE = 'brooklyn_bridge';
    public const LOCATION_TIFFANY_AND_CO = 'tiffany_and_co';
    public const LOCATION_MARQUEE = 'marquee';
    public const LOCATION_MUSEUM_OF_MODERN_ART = 'museum_of_modern_art';
    public const LOCATION_BDIPLUS = 'bdiplus';
    public const LOCATION_RED_HOOK_TERMINAL = 'red_hook_terminal';
    public const LOCATION_ONE57 = 'one57';

    public const REFERENCE_IDENTIFIER = 'location_';
    public const DATA = [
        self::LOCATION_CHASE_BANK => [
            'name' => 'Chase Bank',
            'address' => '405 Lexington Ave, New York, NY 10174, United States',
            'latitude' => 40.75289210721013,
            'longitude' => -73.97348203241299,
            'placeId' => 'N6w4939ZxLCD7PFt8',
        ],
        self::LOCATION_BROOKLYN_BRIDGE => [
            'name' => 'Brooklyn Bridge',
            'address' => 'New York, NY 10038, United States',
            'latitude' => 40.7064160094788,
            'longitude' => -73.995366290234,
            'placeId' => 'XUt3K5JTSLcTVss29',
        ],
        self::LOCATION_TIFFANY_AND_CO => [
            'name' => 'Tiffany & Co.',
            'address' => '37 Wall St, New York, NY 10005, United States',
            'latitude' => 40.707121980672184,
            'longitude' => -74.00896543110225,
            'placeId' => 'eeyMG1FLSWjDJYE48',
        ],
        self::LOCATION_MARQUEE => [
            'name' => 'Marquee',
            'address' => '289 10th Ave, New York, NY 10001, United States',
            'latitude' => 40.75019928902144,
            'longitude' => -74.00238256744451,
            'placeId' => 'gmTSuhQAeGvS1AkB8',
        ],
        self::LOCATION_MUSEUM_OF_MODERN_ART => [
            'name' => 'The Museum of Modern Art',
            'address' => '11 W 53rd St, New York, NY 10019, United States',
            'latitude' => 40.763012910356615,
            'longitude' => -73.97137382233036,
            'placeId' => 'p5YANuiJDJs6B9HR9',
        ],
        self::LOCATION_RED_HOOK_TERMINAL => [
            'name' => 'Red Hook Terminal',
            'address' => '70 Hamilton Ave, Brooklyn, NY 11231, United States',
            'latitude' => 40.684101844962186,
            'longitude' => -74.00592073774675,
            'placeId' => '4ACXjdUZr39DPD23A',
        ],
        self::LOCATION_ONE57 => [
            'name' => 'One57',
            'address' => '157 W 57th St, New York, NY 10019, United States',
            'latitude' => 40.765558037851655,
            'longitude' => -73.97875785264235,
            'placeId' => 'Z96aLev5jbZF6XHr6',
        ],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $location) {
            $newLocation = (new Location())
                ->setName($location['name'])
                ->setAddress($location['address'])
                ->setLatitude($location['latitude'])
                ->setLongitude($location['longitude'])
                ->setPlaceId($location['placeId'])
            ;

            $manager->persist($newLocation);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newLocation);
        }

        $manager->flush();
    }
}
