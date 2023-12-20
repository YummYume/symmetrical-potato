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
use App\Google\GoogleMaps;
use App\Helper\ExceptionHelper;
use App\Repository\LocationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<Heist>
 */
final class HeistProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<Heist> $persistProcessor
     * @param ProcessorInterface<Heist> $removeProcessor
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
    ) {
    }

    public function process(mixed $heist, Operation $operation, array $uriVariables = [], array $context = []): ?Heist
    {
        if ($operation instanceof DeleteMutation) {
            return $this->removeProcessor->process($heist, $operation, $uriVariables, $context);
        }

        if (!$heist instanceof Heist || !$operation instanceof Mutation) {
            return $this->persistProcessor->process($heist, $operation, $uriVariables, $context);
        }

        // Create mutation
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
                dump($place);
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

        return $this->persistProcessor->process($heist, $operation, $uriVariables, $context);
    }
}
