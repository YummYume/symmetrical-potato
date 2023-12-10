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
    public const LOCATION_BANK_AMERICA_TOWER = 'bank_america_tower';
    public const LOCATION_RED_HOOK_TERMINAL = 'red_hook_terminal';
    public const LOCATION_ONE57 = 'one57';

    public const REFERENCE_IDENTIFIER = 'location_';
    public const DATA = [
        self::LOCATION_CHASE_BANK => [
            'name' => 'Chase Bank',
            'address' => '1260 Broadway, New York, NY 10001, United States',
            'latitude' => 40.7484159,
            'longitude' => -73.9902008,
            'placeId' => 'ChIJPwW4-5dZwokRBNtLAdrdUSc',
        ],
        self::LOCATION_BROOKLYN_BRIDGE => [
            'name' => 'Brooklyn Bridge',
            'address' => 'New York, NY 10038, United States',
            'latitude' => 40.7058094,
            'longitude' => -73.9985485,
            'placeId' => 'ChIJK3vOQyNawokRXEa9errdJiU',
        ],
        self::LOCATION_TIFFANY_AND_CO => [
            'name' => 'Tiffany & Co.',
            'address' => '37 Wall St, New York, NY 10005, United States',
            'latitude' => 40.7065364,
            'longitude' => -74.0125703,
            'placeId' => 'ChIJjyX2GqRZwokRT-gdcGoPuSI',
        ],
        self::LOCATION_MARQUEE => [
            'name' => 'Marquee',
            'address' => '289 10th Ave, New York, NY 10001, United States',
            'latitude' => 40.7500995,
            'longitude' => -74.0053801,
            'placeId' => 'ChIJBwnlGrdZwokRpf61pMm860c',
        ],
        self::LOCATION_MUSEUM_OF_MODERN_ART => [
            'name' => 'The Museum of Modern Art',
            'address' => '11 W 53rd St, New York, NY 10019, United States',
            'latitude' => 40.7614327,
            'longitude' => -73.9801965,
            'placeId' => 'ChIJKxDbe_lYwokRVf__s8CPn-o',
        ],
        self::LOCATION_BANK_AMERICA_TOWER => [
            'name' => 'Bank of America Tower',
            'address' => 'New York, NY 10036, USA',
            'latitude' => 40.7556973,
            'longitude' => -73.9849113,
            'placeId' => 'ChIJ8zHZtKpZwokRLJ0995gwmqs',
        ],
        self::LOCATION_RED_HOOK_TERMINAL => [
            'name' => 'Red Hook Container Terminal',
            'address' => '138 Marsh St, Newark, NJ 07114, United States',
            'latitude' => 40.6972995,
            'longitude' => -74.1567801,
            'placeId' => 'ChIJG6Xfh0lSwokRApzFe9PaxWw',
        ],
        self::LOCATION_ONE57 => [
            'name' => 'One57',
            'address' => '157 W 57th St, New York, NY 10019, United States',
            'latitude' => 40.76542,
            'longitude' => -73.9817297,
            'placeId' => 'ChIJMaC6b_dYwokRnaxRK9D05uA',
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
