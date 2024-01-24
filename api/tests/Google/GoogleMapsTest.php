<?php

namespace App\Tests\Lib;

use App\Google\GoogleMaps;
use App\Tests\AbstractTestCase;

final class GoogleMapsTest extends AbstractTestCase
{
    public const MUSEUM_NYC_LATITUDE = 40.7429427;
    public const MUSEUM_NYC_LONGITUDE = -74.1714034;

    public const PLACE = [
        'displayName' => [
            'text' => 'The Newark Museum of Art',
        ],
        'formattedAddress' => '49 Washington St, Newark, NJ 07102, USA',
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
        $place = $this->googleMaps->getPlaceInfornationsByCoordinates(self::MUSEUM_NYC_LATITUDE, self::MUSEUM_NYC_LONGITUDE);

        $this->assertIsArray($place);
        $this->assertEquals(self::MUSEUM_NYC_LATITUDE, $place['location']['latitude']);
        $this->assertEquals(self::MUSEUM_NYC_LONGITUDE, $place['location']['longitude']);
        $this->assertEquals(self::PLACE['displayName']['text'], $place['displayName']['text']);
        $this->assertEquals(self::PLACE['formattedAddress'], $place['formattedAddress']);
        $this->assertEquals(self::PLACE['placeId'], $place['id']);
    }

    /**
     * Test to get place informations by place id.
     */
    public function testGetPlaceInfornationsById(): void
    {
        $place = $this->googleMaps->getPlaceDetailsById(self::PLACE['placeId']);

        $this->assertIsArray($place);
        $this->assertEquals(self::MUSEUM_NYC_LATITUDE, $place['location']['latitude']);
        $this->assertEquals(self::MUSEUM_NYC_LONGITUDE, $place['location']['longitude']);
        $this->assertEquals(self::PLACE['displayName']['text'], $place['displayName']['text']);
        $this->assertEquals(self::PLACE['formattedAddress'], $place['formattedAddress']);
        $this->assertEquals(self::PLACE['placeId'], $place['id']);
    }
}
