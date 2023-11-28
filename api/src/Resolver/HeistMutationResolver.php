<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use ApiPlatform\Validator\ValidatorInterface;
use App\Entity\Heist;
use App\Entity\Location;
use App\Lib\GoogleMaps;
use App\Repository\LocationRepository;
use Doctrine\ORM\EntityManagerInterface;

final class HeistMutationResolver implements MutationResolverInterface
{
    public function __construct(
        private readonly LocationRepository $locationRepository,
        private readonly EntityManagerInterface $entityManager,
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
            $place = $this->googleMaps->getPlaceInfornationsByCoordinates($item->getLatitude(), $item->getLongitude());

            $location = (new Location())
                ->setLatitude($place['coordinates']['latitude'])
                ->setLongitude($place['coordinates']['longitude'])
                ->setName($place['displayName']['text'])
                ->setAddress($place['address'])
                ->setPlaceId($place['placeId']);

            $this->validator->validate($location, ['groups' => 'location:create']);

            $this->entityManager->persist($location);
            $this->entityManager->flush();
        }

        $item->setLocation($location);

        return $item;
    }
}
