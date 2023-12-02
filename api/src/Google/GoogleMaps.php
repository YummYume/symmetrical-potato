<?php

namespace App\Google;

use App\Helper\ExceptionHelper;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class GoogleMaps
{
    public const BOUNDS = [
        'north' => 40.9176,
        'south' => 40.4774,
        'east' => -73.7002,
        'west' => -74.0431,
    ];

    public function __construct(
        private readonly string $apiKey,
        private readonly HttpClientInterface $client,
        private readonly ExceptionHelper $exceptionHelper
    ) {
    }

    /**
     * Get the latitude and longitude from a given address.
     *
     * @return array{latitude: string, longitude: string}
     */
    public function getCoordinatesByAddress(string $address): array
    {
        try {
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
        } catch (\Exception $e) {
            throw $this->exceptionHelper->createTranslatableHttpException($e->getCode(), $this->httpErrorByCode($e->getCode()));
        }
    }

    /**
     * Get the address from a given latitude and longitude.
     */
    public function getAddressByCoordinates(float $latitude, float $longitude): string
    {
        try {
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
        } catch (\Exception $e) {
            throw $this->exceptionHelper->createTranslatableHttpException($e->getCode(), $this->httpErrorByCode($e->getCode()));
        }
    }

    /**
     * Get the latitude, longitude and placeId from a given address.
     *
     * @return array{placeId: string, latitude: string, longitude: string}
     */
    public function getGeoCoding(string $address): array
    {
        try {
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
        } catch (\Exception $e) {
            throw $this->exceptionHelper->createTranslatableHttpException($e->getCode(), $this->httpErrorByCode($e->getCode()));
        }
    }

    /**
     * Get the address and placeId from a given latitude and longitude.
     *
     * @return array{placeId: string, address: string}
     */
    public function getGeoCodingReverse(float $latitude, float $longitude): array
    {
        try {
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

            return [
                'address' => $content['results'][0]['formatted_address'],
                'placeId' => $content['results'][0]['place_id'],
            ];
        } catch (\Exception $e) {
            throw $this->exceptionHelper->createTranslatableHttpException($e->getCode(), $this->httpErrorByCode($e->getCode()));
        }
    }

    /**
     * Get the placeId from a given address.
     */
    public function getPlaceIdByAddress(string $address): string
    {
        try {
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
        } catch (\Exception $e) {
            throw $this->exceptionHelper->createTranslatableHttpException($e->getCode(), $this->httpErrorByCode($e->getCode()));
        }
    }

    /**
     * Get the details of a place from a given placeId.
     *
     * @return array{placeId: string, displayName: array{text: string, languageCode: string}, types: array<int, string>}
     */
    public function getPlaceDetailsById(string $placeId): array
    {
        try {
            $response = $this->client->request(
                'GET',
                sprintf('https://places.googleapis.com/v1/places/%s', $placeId),
                [
                    'query' => [
                        'fields' => 'id,displayName,types',
                        'key' => $this->apiKey,
                    ],
                ]
            );

            $content = $response->toArray();

            return $content;
        } catch (\Exception $e) {
            throw $this->exceptionHelper->createTranslatableHttpException($e->getCode(), $this->httpErrorByCode($e->getCode()));
        }
    }

    /**
     * Get informations of a place from a given latitude and longitude.
     *
     * @return array{address: string, placeId: string, displayName: array{text: string, languageCode: string}, types: array<int, string>, coordinates: array{latitude: float, longitude: float}}
     */
    public function getPlaceInfornationsByCoordinates(float $latitude, float $longitude): array
    {
        $place = $this->getGeoCodingReverse($latitude, $longitude);
        $placeDetails = $this->getPlaceDetailsById($place['placeId']);

        return array_unique(array_merge($place, $placeDetails, ['coordinates' => ['latitude' => $latitude, 'longitude' => $longitude]]), \SORT_REGULAR);
    }

    /**
     * Check if a given latitude and longitude are in the bounds.
     */
    public function isInBounds(float $latitude, float $longitude): bool
    {
        return $latitude <= self::BOUNDS['north'] && $latitude >= self::BOUNDS['south'] && $longitude <= self::BOUNDS['east'] && $longitude >= self::BOUNDS['west'];
    }

    /**
     * Get the error message from a given http code.
     */
    private function httpErrorByCode(int $code): string
    {
        return match ($code) {
            400 => 'google_api.bad_request',
            401 => 'google_api.unauthorized',
            403 => 'google_api.forbidden',
            404 => 'google_api.not_found',
            429 => 'google_api.too_many_requests',
            500 => 'google_api.internal_server_error',
            503 => 'google_api.service_unavailable',
            default => 'google_api.error',
        };
    }
}
