<?php

namespace App\Tests\Lib;

use App\Lib\GoogleMaps;
use App\Tests\AbstractTestCase;

final class GoogleMapsTest extends AbstractTestCase
{
    public const NEW_YORK_LATITUDE = 40.742949784543825;
    public const NEW_YORK_LONGITUDE = -74.17140255510886;

    public const PLACE = [
        'latitude' => self::NEW_YORK_LATITUDE,
        'longitude' => self::NEW_YORK_LONGITUDE,
        'displayName' => [
            'text' => 'The Newark Museum of Art',
        ],
        'address' => '49 Washington St, Newark, NJ 07102, USA',
        'placeId' => 'ChIJ5fsDD4BUwokRxwsQqWQjEMM',
    ];

    private GoogleMaps $googleMaps;

    public function setUp(): void
    {
        parent::setUp();

        $this->googleMaps = $this->getContainer()->get(GoogleMaps::class);
    }

    /**
     * Test to get place informations by coordinates.
     */
    public function testGetPlaceInfornationsByCoordinates(): void
    {
        $place = $this->googleMaps->getPlaceInfornationsByCoordinates(self::NEW_YORK_LATITUDE, self::NEW_YORK_LONGITUDE);

        $this->assertIsArray($place);
        $this->assertEquals(self::PLACE['latitude'], $place['coordinates']['latitude']);
        $this->assertEquals(self::PLACE['longitude'], $place['coordinates']['longitude']);
        $this->assertEquals(self::PLACE['displayName']['text'], $place['displayName']['text']);
        $this->assertEquals(self::PLACE['address'], $place['address']);
        $this->assertEquals(self::PLACE['placeId'], $place['placeId']);
    }
}
