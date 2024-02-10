<?php

namespace App\State;

use ApiPlatform\Metadata\GraphQl\DeleteMutation;
use ApiPlatform\Metadata\GraphQl\Mutation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\Validator\ValidatorInterface;
use App\Entity\Heist;
use App\Entity\Location;
use App\Entity\User;
use App\Enum\HeistVisibilityEnum;
use App\Google\GoogleMaps;
use App\Helper\ExceptionHelper;
use App\Repository\LocationRepository;
use App\Service\Refunder;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<Heist, Heist>
 */
final class HeistProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<Heist, Heist> $persistProcessor
     * @param ProcessorInterface<Heist, Heist> $removeProcessor
     */
    public function __construct(
        #[Autowire('@api_platform.doctrine.orm.state.persist_processor')] private readonly ProcessorInterface $persistProcessor,
        #[Autowire('@api_platform.doctrine.orm.state.remove_processor')] private readonly ProcessorInterface $removeProcessor,
        private readonly EntityManagerInterface $entityManager,
        private readonly LocationRepository $locationRepository,
        private readonly ValidatorInterface $validator,
        private readonly Security $security,
        private readonly ExceptionHelper $exceptionHelper,
        private readonly GoogleMaps $googleMaps,
        private readonly Refunder $refunder,
    ) {
    }

    public function process(mixed $heist, Operation $operation, array $uriVariables = [], array $context = []): ?Heist
    {
        if (!$heist instanceof Heist || !$operation instanceof Mutation) {
            return $this->persistProcessor->process($heist, $operation, $uriVariables, $context);
        }

        if ('create' === $operation->getName()) {
            if (!$this->security->getUser() instanceof User) {
                throw $this->exceptionHelper->createTranslatableHttpException(403, 'common.not_authenticated');
            }

            $location = $this->locationRepository->findOneBy([
                'placeId' => $heist->getPlaceId(),
            ]);

            if (null === $location) {
                // Get informations from Google Maps for the location
                $place = $this->googleMaps->getPlaceDetailsById($heist->getPlaceId());

                $location = (new Location())
                    ->setLatitude($place['location']['latitude'])
                    ->setLongitude($place['location']['longitude'])
                    ->setName($place['displayName']['text'])
                    ->setAddress($place['formattedAddress'])
                    ->setPlaceId($place['id']);

                $this->validator->validate($location, ['groups' => Location::WRITE]);

                $this->entityManager->persist($location);
            }

            $heist->setLocation($location);
        }

        if ('update' === $operation->getName()) {
            $user = $this->security->getUser();

            if (!$user instanceof User) {
                throw $this->exceptionHelper->createTranslatableHttpException(403, 'common.not_authenticated');
            }

            if (HeistVisibilityEnum::Public === $heist->getVisibility()) {
                if ($user->getBalance() - Heist::CREATE_HEIST_PRICE < 0) {
                    throw $this->exceptionHelper->createTranslatableHttpException(400, 'heist.not_enough_money');
                }

                $user->setBalance($user->getBalance() - Heist::CREATE_HEIST_PRICE);

                $this->validator->validate($user, ['groups' => User::UPDATE]);

                $this->entityManager->persist($user);
            }
        }

        if ($operation instanceof DeleteMutation) {
            $user = $this->security->getUser();

            if (!$user instanceof User) {
                throw $this->exceptionHelper->createTranslatableHttpException(403, 'common.not_authenticated');
            }

            if (HeistVisibilityEnum::Public === $heist->getVisibility()) {
                $user->setBalance($user->getBalance() + Heist::CREATE_HEIST_PRICE * Heist::PERCENTAGE_REFUND);

                $this->validator->validate($user, ['groups' => User::UPDATE]);

                $this->entityManager->persist($user);

                $this->refunder->refundAssetsOfHeist($heist);
            }

            return $this->removeProcessor->process($heist, $operation, $uriVariables, $context);
        }

        return $this->persistProcessor->process($heist, $operation, $uriVariables, $context);
    }
}
