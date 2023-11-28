<?php

namespace App\Lib;

use Symfony\Contracts\HttpClient\HttpClientInterface;

final class GoogleMaps
{
    public const BOUNDS = [
        'north' => 40.9176,
        'south' => 40.4774,
        'east' => -73.7002,
        'west' => -74.0431,
    ];

    public function __construct(private readonly string $apiKey, private readonly HttpClientInterface $client)
    {
    }

    /**
     * Get the latitude and longitude from a given address.
     *
     * @return array<string, float>
     */
    public function getCoordinates(string $address): array
    {
        $response = $this->client->request(
            'GET',
            'https://maps.googleapis.com/maps/api/geocode/json',
            [
                'query' => [
                    'address' => $address,
                    'bounds' => self::BOUNDS['south'].','.self::BOUNDS['west'].'|'.self::BOUNDS['north'].','.self::BOUNDS['east'],
                    'key' => $this->apiKey,
                ],
            ]
        );

        $content = $response->toArray();

        return [
            'latitude' => $content['results'][0]['geometry']['location']['lat'],
            'longitude' => $content['results'][0]['geometry']['location']['lng'],
        ];
    }

    /**
     * Get the address from a given latitude and longitude.
     */
    public function getAddress(float $latitude, float $longitude): string
    {
        $response = $this->client->request(
            'GET',
            'https://maps.googleapis.com/maps/api/geocode/json',
            [
                'query' => [
                    'latlng' => $latitude.','.$longitude,
                    'bounds' => self::BOUNDS['south'].','.self::BOUNDS['west'].'|'.self::BOUNDS['north'].','.self::BOUNDS['east'],
                    'key' => $this->apiKey,
                ],
            ]
        );

        $content = $response->toArray();

        return $content['results'][0]['formatted_address'];
    }

    /**
     * Get the latitude, longitude and placeId from a given address.
     *
     * @return array<string, float|string>
     */
    public function getGeoCoding(string $address): array
    {
        $response = $this->client->request(
            'GET',
            'https://maps.googleapis.com/maps/api/geocode/json',
            [
                'query' => [
                    'address' => $address,
                    'bounds' => self::BOUNDS['south'].','.self::BOUNDS['west'].'|'.self::BOUNDS['north'].','.self::BOUNDS['east'],
                    'key' => $this->apiKey,
                ],
            ]
        );

        $content = $response->toArray();

        return [
            'latitude' => $content['results'][0]['geometry']['location']['lat'],
            'longitude' => $content['results'][0]['geometry']['location']['lng'],
            'placeId' => $content['results'][0]['place_id'],
        ];
    }

    /**
     * Get the address and placeId from a given latitude and longitude.
     *
     * @return array<string, string>
     */
    public function getGeoCodingReverse(float $latitude, float $longitude): array
    {
        $response = $this->client->request(
            'GET',
            'https://maps.googleapis.com/maps/api/geocode/json',
            [
                'query' => [
                    'latlng' => $latitude.','.$longitude,
                    'bounds' => self::BOUNDS['south'].','.self::BOUNDS['west'].'|'.self::BOUNDS['north'].','.self::BOUNDS['east'],
                    'location_type' => 'ROOFTOP',
                    'key' => $this->apiKey,
                ],
            ]
        );

        $content = $response->toArray();

        dump($content);

        return [
            'address' => $content['results'][0]['formatted_address'],
            'placeId' => $content['results'][0]['place_id'],
        ];
    }

    /**
     * Get the placeId from a given address.
     */
    public function getPlaceIdByAddress(string $address): string
    {
        $response = $this->client->request(
            'GET',
            'https://maps.googleapis.com/maps/api/geocode/json',
            [
                'query' => [
                    'address' => $address,
                    'bounds' => self::BOUNDS['south'].','.self::BOUNDS['west'].'|'.self::BOUNDS['north'].','.self::BOUNDS['east'],
                    'key' => $this->apiKey,
                ],
            ]
        );

        $content = $response->toArray();

        return $content['results'][0]['place_id'];
    }

    public function getPlaceById(string $placeId): array
    {
        $response = $this->client->request(
            'GET',
            'https://maps.googleapis.com/maps/api/place/details/json',
            [
                'query' => [
                    'place_id' => $placeId,
                    'key' => $this->apiKey,
                ],
            ]
        );

        $content = $response->toArray();
        dump($content);

        return [
            'latitude' => $content['result']['geometry']['location']['lat'],
            'longitude' => $content['result']['geometry']['location']['lng'],
        ];
    }

    public function getPlaceDetailsById(string $placeId): array
    {
        $response = $this->client->request(
            'GET',
            "https://places.googleapis.com/v1/places/$placeId",
            [
                'query' => [
                    'key' => $this->apiKey,
                ],
            ]
        );

        $content = $response->toArray();
        dump($content);

        return [];
    }

    /**
     * Check if a given latitude and longitude are in the bounds.
     */
    public function isInBounds(float $latitude, float $longitude): bool
    {
        return $latitude <= self::BOUNDS['north'] && $latitude >= self::BOUNDS['south'] && $longitude <= self::BOUNDS['east'] && $longitude >= self::BOUNDS['west'];
    }
}
