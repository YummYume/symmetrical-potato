<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

final class ProfileFixtures extends Fixture implements DependentFixtureInterface
{
    public const REFERENCE_IDENTIFIER = 'profile_';
    public const DATA = [
        UserFixtures::HEISTER_DALLAS => [
            'description' => "Everybody listen up! This is a robbery! We're leaving with this bank's money! There's NO question about that. The only question you need to ask yourself is this: Do I wanna make it out of here alive? You do what we say. You don't try to be a hero, you don't do ANYTHING to fuck with us! You will likely live to see tomorrow.",
        ],
        UserFixtures::HEISTER_HOXTON => [
            'description' => "Alright, you tossers! Listen up! We're here to rob this bank and there's precious little you can do about it! If we think you look dodgy, if you're takin' the piss, we WILL shoot you and we're not gonna feel bad about it in the slightest! Do you understand me you fucking wankers?!",
        ],
        UserFixtures::HEISTER_CHAINS => [
            'description' => "BITCHES! Listen up! This…is a GODDAMN robbery! We leavin' with this bank's money, and you don't wanna test the little patience I got by tryna do anything about it! Anybody tryin' to stop us? BLAGOW!!! We shoot you! Anybody tryin' to call the cops? BLAGOW!!! We shoot you! Anybody fuck wit' us in ANY. FUCKING. WAY. BLAH-GOW!!! We shoot you!!! Now get the FUCK down, and SHUT. the FUCK. UP!!!",
        ],
        UserFixtures::HEISTER_WOLF => [
            'description' => "Okay everybody, this is not a drill! We're here to rob this place, and there isn't a goddamn thing you can do about it! If you fuck with us, YOU'RE DEAD!!! So for your own sakes, don't fucking fuck with us!!! Just keep calm, get down on the floor, and stay out of our way!! And maybe, just maybe, you'll live to tell the stories about this one day! Okay!?",
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
        foreach (array_keys(UserFixtures::DATA) as $key) {
            /** @var User $user */
            $user = $this->getReference(UserFixtures::REFERENCE_IDENTIFIER.$key, User::class);
            $userProfile = $user->getProfile();
            $profile = self::DATA[$key] ?? null;

            if (null !== $profile) {
                $userProfile->setDescription($profile['description']);
            }

            $manager->persist($userProfile);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $userProfile);
        }

        $manager->flush();
    }
}
