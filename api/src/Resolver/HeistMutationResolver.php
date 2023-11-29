<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use ApiPlatform\Validator\ValidatorInterface;
use App\Entity\Heist;
use App\Entity\Location;
use App\Entity\User;
use App\Helper\ExceptionHelper;
use App\Lib\GoogleMaps;
use App\Repository\LocationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

final class HeistMutationResolver implements MutationResolverInterface
{
    public function __construct(
        private readonly Security $security,
        private readonly ExceptionHelper $exceptionHelper,
        private readonly EntityManagerInterface $entityManager,
        private readonly ValidatorInterface $validator,
        private readonly LocationRepository $locationRepository,
        private readonly GoogleMaps $googleMaps,
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

        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return null;
        }

        $this->validator->validate($item, ['groups' => Heist::CREATE]);

        if (!$user->getEstablishments()->contains($item->getEstablishment())) {
            throw $this->exceptionHelper->createTranslatableHttpException(403, 'heist.establishment.not_allowed');
        }

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

            $this->validator->validate($location, ['groups' => Location::CREATE]);

            $this->entityManager->persist($location);
            $this->entityManager->flush();
        }

        $item->setLocation($location);

        return $item;
    }
}
