<?php

namespace App\DataFixtures;

use App\Entity\ContractorRequest;
use App\Entity\User;
use App\Enum\ContractorRequestStatusEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

final class ContractorRequestFixtures extends Fixture implements DependentFixtureInterface
{
    public const REFERENCE_IDENTIFIER = 'contractor-request_';
    public const DATA = [
        UserFixtures::CONTRACTOR_SHADE => [
            'status' => ContractorRequestStatusEnum::Accepted,
            'reason' => 'Experienced contractor from New York.',
        ],
        UserFixtures::CONTRACTOR_SHAYU => [
            'status' => ContractorRequestStatusEnum::Accepted,
            'reason' => 'Ready to earn some money? I still owe you a favor.',
        ],
        UserFixtures::CONTRACTOR_BUTCHER => [
            'status' => ContractorRequestStatusEnum::Accepted,
            'reason' => 'So the Payday gang is back? I have a job for you.',
        ],
        UserFixtures::CONTRACTOR_VLAD => [
            'status' => ContractorRequestStatusEnum::Accepted,
            'reason' => 'Hey my friends, Vlad is always ready to help you.',
        ],
        UserFixtures::CONTRACTOR_BECKETT => [
            'status' => ContractorRequestStatusEnum::Accepted,
            'reason' => 'Specialist in the art of stealth. New York is my playground.',
        ],
        UserFixtures::CONTRACTOR_MAC => [
            'status' => ContractorRequestStatusEnum::Accepted,
            'reason' => 'So you want to earn some money? I know a place for you.',
        ],
        UserFixtures::CONTRACTOR_KEEGAN => [
            'status' => ContractorRequestStatusEnum::Accepted,
            'reason' => "I'm ready to help you, but you better do the job right.",
        ],
        UserFixtures::CONTRACTOR_PENDING => [
            'status' => ContractorRequestStatusEnum::Pending,
            'reason' => 'You want to earn some money? I have the right heist for you.',
        ],
        UserFixtures::CONTRACTOR_REJECTED => [
            'status' => ContractorRequestStatusEnum::Rejected,
            'reason' => 'I know what happened to Bain.',
        ],
    ];

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
        ];
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $contractorRequest) {
            /** @var User $user */
            $user = $this->getReference(UserFixtures::REFERENCE_IDENTIFIER.$key, User::class);
            $newContractorRequest = (new ContractorRequest())
                ->setUser($user)
                ->setStatus($contractorRequest['status'])
                ->setReason($contractorRequest['reason'])
            ;
            $user->setContractorRequest($newContractorRequest);

            $manager->persist($user);
            $manager->persist($newContractorRequest);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newContractorRequest);
        }

        $manager->flush();
    }
}
