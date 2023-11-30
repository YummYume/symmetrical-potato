<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use ApiPlatform\Validator\ValidatorInterface;
use App\Entity\Heist;
use App\Entity\Location;
use App\Entity\User;
use App\Enum\HeistVisibilityEnum;
use App\Helper\ExceptionHelper;
use App\Lib\GoogleMaps;
use App\Repository\HeistRepository;
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
        private readonly HeistRepository $heistRepository,
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
            'updateHeist' => $this->update($item),
            default => null,
        };
    }

    public function create(?object $item): ?Heist
    {
        if (null === $item || !$item instanceof Heist) {
            return null;
        }

        $user = $this->security->getUser();

        if (null === $user || !$user instanceof User) {
            return null;
        }

        $this->validator->validate($item, ['groups' => Heist::WRITE]);

        // Check if the establishment is owned by the user or if the user is an admin
        if (!$user->getEstablishments()->contains($item->getEstablishment()) || $this->security->isGranted(User::ROLE_ADMIN)) {
            throw $this->exceptionHelper->createTranslatableHttpException(403, 'heist.establishment.not_allowed');
        }

        $location = $this->locationRepository->findOneBy([
            'latitude' => $item->getLatitude(),
            'longitude' => $item->getLongitude(),
        ]);

        if (null === $location) {
            // Get informations from Google Maps for the location
            $place = $this->googleMaps->getPlaceInfornationsByCoordinates($item->getLatitude(), $item->getLongitude());

            $location = (new Location())
                ->setLatitude($place['coordinates']['latitude'])
                ->setLongitude($place['coordinates']['longitude'])
                ->setName($place['displayName']['text'])
                ->setAddress($place['address'])
                ->setPlaceId($place['placeId']);

            $this->validator->validate($location, ['groups' => Location::WRITE]);

            $this->entityManager->persist($location);
        }

        $item->setLocation($location);

        return $item;
    }

    public function update(?object $item): ?Heist
    {
        if (null === $item || !$item instanceof Heist) {
            return null;
        }

        $user = $this->security->getUser();

        if (null === $user || !$user instanceof User) {
            throw $this->exceptionHelper->createTranslatableHttpException(401, 'user.not_authenticated');
        }

        if (null === $item->getId()) {
            throw $this->exceptionHelper->createTranslatableHttpException(400, 'common.not_found');
        }

        // Check if the heist is owned by the establishment of the user or if the user is an admin
        if (!$user->getEstablishments()->contains($item->getEstablishment()) || $this->security->isGranted(User::ROLE_ADMIN)) {
            throw $this->exceptionHelper->createTranslatableHttpException(403, 'common.unauthorized');
        }

        $this->validator->validate($item, ['groups' => Heist::UPDATE]);

        // Check if a slot is available for the heist when you want to make it public
        if (!$this->heistRepository->slotAvailable($item) && $item->getVisibility() === HeistVisibilityEnum::Public) {
            throw $this->exceptionHelper->createTranslatableHttpException(400, 'heist.slot.not_available');
        }

        return $item;
    }
}
