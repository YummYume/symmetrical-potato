<?php

namespace App\Resolver;

use ApiPlatform\GraphQl\Resolver\MutationResolverInterface;
use App\Entity\Heist;
use App\Repository\LocationRepository;

final class HeistMutationResolver implements MutationResolverInterface
{
    public function __construct(
        private readonly LocationRepository $locationRepository,
    ) {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function __invoke(?object $item, array $context): ?object
    {
        return match ($context['info']->fieldName) {
            'createHeist' => $this->create($context),
            default => null,
        };
    }

    /**
     * @param array<string, mixed> $context
     */
    public function create(array $context): ?Heist
    {
        dump($context['args']['input']);
        dump($context);
        // $location = $this->locationRepository->findOneBy([
        //     'latitude' => $context['args']['input']['location']['latitude'],
        //     'longitude' => $context['args']['input']['location']['longitude'],
        // ]);

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
