<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use ApiPlatform\Validator\ValidatorInterface;
use App\Entity\Heist;
use App\Lib\GoogleMaps;
use App\Repository\LocationRepository;

final class HeistMutationResolver implements MutationResolverInterface
{
    public function __construct(
        private readonly LocationRepository $locationRepository,
        private readonly ValidatorInterface $validator,
        private readonly GoogleMaps $googleMaps
    ) {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function __invoke(?object $item, array $context): ?object
    {
        return match ($context['info']->fieldName) {
            'createHeist' => $this->create($item),
            default => null,
        };
    }

    public function create(?object $item): ?Heist
    {
        if (null === $item || !$item instanceof Heist) {
            return null;
        }

        $this->validator->validate($item, ['groups' => 'heist:create']);

        $location = $this->locationRepository->findOneBy([
            'latitude' => $item->getLatitude(),
            'longitude' => $item->getLongitude(),
        ]);

        if (null === $location) {
            // TODO check if location is valid (e.g. with google maps api) and create it if it is else throw error

            // $this->googleMaps->getGeoCoding('49 Washington St, Newark, NJ 07102, États-Unis');
            $this->googleMaps->getPlaceDetailsById('ChIJEbe_EYBUwokRVFFMEcYKXkc');
            // $this->googleMaps->getGeoCodingReverse($item->getLatitude(), $item->getLongitude());

            return null;
        }

        return null;

        // if (null === $location) {
        //     return null;
        //     // TODO check if location is valid (e.g. with google maps api) and create it if it is else throw error
        // }

        // $heist = (new Heist())
        //     ->setName($context['args']['input']['name'])
        //     ->setDescription($context['args']['input']['description'])
        //     ->setMaximumPayout($context['args']['input']['maximumPayout'])
        //     ->setMinimumPayout($context['args']['input']['minimumPayout'])
        //     ->setPreferedTactic($context['args']['input']['preferedTactic'])
        //     ->setDifficulty($context['args']['input']['difficulty'])
        //     ->setVisibility($context['args']['input']['visibility'])
        //     ->setPhase($context['args']['input']['phase'])
        //     ->setLocation($location)
        //     ->addAllowedEmployee($context['args']['input']['allowedEmployees'])
        //     ->setEstablishment($context['args']['input']['establishment'])
        //     ->addForbiddenAsset($context['args']['input']['forbiddenAssets'])
        //     ->addForbiddenUser($context['args']['input']['forbiddenUsers'])
        //     ->setStartAt($context['args']['input']['startTime'])
        //     ->setShouldEndAt($context['args']['input']['shouldEndAt'])
        // ;

        // return $heist;
    }
}
