<?php

namespace App\DataFixtures;

use App\Entity\Establishment;
use App\Entity\Location;
use App\Entity\Review;
use App\Entity\User;
use App\Enum\ReviewRatingEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

final class ReviewFixtures extends Fixture implements DependentFixtureInterface
{
    public const REFERENCE_IDENTIFIER = 'review_';
    public const DATA = [
        // Locations
        // Chase Bank
        [
            'rating' => ReviewRatingEnum::Five,
            'location' => LocationFixtures::LOCATION_CHASE_BANK,
            'review' => 'Very easy to rob, the cops are slow to arrive and there are plenty of civilians to take as hostages.',
            'reviewer' => UserFixtures::HEISTER_DALLAS,
        ],
        [
            'rating' => ReviewRatingEnum::Four,
            'location' => LocationFixtures::LOCATION_CHASE_BANK,
            'review' => 'The cops arrived quickly, but the vault was easy to open.',
            'reviewer' => UserFixtures::HEISTER_JOY,
        ],
        [
            'rating' => ReviewRatingEnum::Five,
            'location' => LocationFixtures::LOCATION_CHASE_BANK,
            'review' => "Vault was easily accessible, but what an escape! We had to fight our way out. But that's what I like. For less experienced heisters, I recommend a stealth approach, or a zipline.",
            'reviewer' => UserFixtures::HEISTER_CHAINS,
        ],
        // Brooklyn Bridge
        [
            'rating' => ReviewRatingEnum::Four,
            'location' => LocationFixtures::LOCATION_BROOKLYN_BRIDGE,
            'review' => 'Intense place, a good crew is a must. Pay is usually very good, but cops arrive quickly.',
            'reviewer' => UserFixtures::HEISTER_DALLAS,
        ],
        [
            'rating' => ReviewRatingEnum::Two,
            'location' => LocationFixtures::LOCATION_BROOKLYN_BRIDGE,
            'review' => 'The cops arrived before we could even find a place to hide. Not recommended.',
            'reviewer' => UserFixtures::HEISTER_HOXTON,
        ],
        // Tiffany & Co.
        [
            'rating' => ReviewRatingEnum::FourPointFive,
            'location' => LocationFixtures::LOCATION_TIFFANY_AND_CO,
            'reviewer' => UserFixtures::HEISTER_HOXTON,
        ],
        [
            'rating' => ReviewRatingEnum::Five,
            'location' => LocationFixtures::LOCATION_TIFFANY_AND_CO,
            'reviewer' => UserFixtures::HEISTER_PEARL,
        ],
        [
            'rating' => ReviewRatingEnum::Five,
            'location' => LocationFixtures::LOCATION_TIFFANY_AND_CO,
            'review' => 'Easy.',
            'reviewer' => UserFixtures::HEISTER_JOY,
        ],
        [
            'rating' => ReviewRatingEnum::FourPointFive,
            'location' => LocationFixtures::LOCATION_TIFFANY_AND_CO,
            'reviewer' => UserFixtures::HEISTER_DALLAS,
        ],
        // Marquee
        [
            'rating' => ReviewRatingEnum::One,
            'location' => LocationFixtures::LOCATION_MARQUEE,
            'review' => 'Too many civilians, I threw a grenade by accident, and you can probably guess what happened next.',
            'reviewer' => UserFixtures::HEISTER_WOLF,
        ],
        [
            'rating' => ReviewRatingEnum::ThreePointFive,
            'location' => LocationFixtures::LOCATION_MARQUEE,
            'reviewer' => UserFixtures::HEISTER_HOXTON,
        ],
        // The Museum of Modern Art
        [
            'rating' => ReviewRatingEnum::FourPointFive,
            'location' => LocationFixtures::LOCATION_MUSEUM_OF_MODERN_ART,
            'review' => "Good place. Hacking the cameras is a must, but that's what I do best.",
            'reviewer' => UserFixtures::HEISTER_JOY,
        ],
        [
            'rating' => ReviewRatingEnum::ThreePointFive,
            'location' => LocationFixtures::LOCATION_MUSEUM_OF_MODERN_ART,
            'review' => "I'm not a stealthy heister, but I still enjoyed this place. It triggers a special thing in me, I can't really explain it.",
            'reviewer' => UserFixtures::HEISTER_WOLF,
        ],
        // Red Hook Terminal
        [
            'rating' => ReviewRatingEnum::Four,
            'location' => LocationFixtures::LOCATION_RED_HOOK_TERMINAL,
            'review' => 'I like this place, but it is a bit too easy.',
            'reviewer' => UserFixtures::HEISTER_JOY,
        ],
        [
            'rating' => ReviewRatingEnum::One,
            'location' => LocationFixtures::LOCATION_RED_HOOK_TERMINAL,
            'reviewer' => UserFixtures::HEISTER_CHAINS,
        ],
        // One57
        [
            'rating' => ReviewRatingEnum::Four,
            'location' => LocationFixtures::LOCATION_ONE57,
            'review' => 'Good place, but make sure you know who the owner of the place is before you start. Crucial information for both stealth and loud approaches.',
            'reviewer' => UserFixtures::HEISTER_DALLAS,
        ],
        [
            'rating' => ReviewRatingEnum::FourPointFive,
            'location' => LocationFixtures::LOCATION_ONE57,
            'review' => 'Same as Dallas.',
            'reviewer' => UserFixtures::HEISTER_PEARL,
        ],
        // Establishments
        // Rooftop Garden
        [
            'rating' => ReviewRatingEnum::FourPointFive,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            'review' => 'Good establishment, instructions are often simple and easy to follow.',
            'reviewer' => UserFixtures::HEISTER_DALLAS,
        ],
        // Old Warehouse, Red Hook
        [
            'rating' => ReviewRatingEnum::ThreePointFive,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_OLD_WAREHOUSE_RED_HOOK,
            'review' => 'Good establishment, but the instructions are often too complicated.',
            'reviewer' => UserFixtures::HEISTER_JOY,
        ],
        // Central Park Cave
        [
            'rating' => ReviewRatingEnum::FourPointFive,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_CENTRAL_PARK_CAVE,
            'review' => 'The contractor is very implicated in the heist, which is a good thing. They also know how to get the best escape routes.',
            'reviewer' => UserFixtures::HEISTER_PEARL,
        ],
        [
            'rating' => ReviewRatingEnum::Five,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_CENTRAL_PARK_CAVE,
            'review' => 'I love this place. The heists are always fun, and the contractor is very nice.',
            'reviewer' => UserFixtures::HEISTER_WOLF,
        ],
        // Brownstone Basement
        [
            'rating' => ReviewRatingEnum::Four,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_BROWNSTONE_BASEMENT,
            'review' => 'Good establishment, but the contractor is a bit too strict.',
            'reviewer' => UserFixtures::HEISTER_HOXTON,
        ],
        // Abandoned Industrial Building, Long Island City
        [
            'rating' => ReviewRatingEnum::OnePointFive,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_INDUSTRIAL_BUILDING_LONG_ISLAND_CITY,
            'review' => 'Very bad establishment, the contractor is very rude and the instructions are often too complicated.',
            'reviewer' => UserFixtures::HEISTER_HOXTON,
        ],
        // Private Library
        [
            'rating' => ReviewRatingEnum::FourPointFive,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_PRIVATE_LIBRARY,
            'review' => 'The contractor is very indulgent, even when I kill civilians. I like that.',
            'reviewer' => UserFixtures::HEISTER_WOLF,
        ],
        // Abandoned Subway Station
        [
            'rating' => ReviewRatingEnum::FourPointFive,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_SUBWAY_STATION,
            'review' => 'Really good establishment.',
            'reviewer' => UserFixtures::HEISTER_HOXTON,
        ],
        [
            'rating' => ReviewRatingEnum::Two,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_SUBWAY_STATION,
            'review' => "Not my thing, the heists often don\'t go as planned.",
            'reviewer' => UserFixtures::HEISTER_PEARL,
        ],
        [
            'rating' => ReviewRatingEnum::Five,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_SUBWAY_STATION,
            'review' => 'This establishment is perfect for me. Complicated but precise instructions, and the contractor is very nice.',
            'reviewer' => UserFixtures::HEISTER_DALLAS,
        ],
    ];

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            EstablishmentFixtures::class,
            LocationFixtures::class,
        ];
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $review) {
            $location = $review['location'] ?? null;
            $establishment = $review['establishment'] ?? null;
            /** @var User $user */
            $user = $this->getReference(UserFixtures::REFERENCE_IDENTIFIER.$review['reviewer'], User::class);

            if (null !== $location) {
                $location = $this->getReference(LocationFixtures::REFERENCE_IDENTIFIER.$location, Location::class);
            } elseif (null !== $establishment) {
                $establishment = $this->getReference(EstablishmentFixtures::REFERENCE_IDENTIFIER.$establishment, Establishment::class);
            }

            $newReview = (new Review())
                ->setRating($review['rating'])
                ->setComment($review['review'] ?? null)
                ->setLocation($location)
                ->setEstablishment($establishment)
                ->setUser($user)
            ;

            $manager->persist($newReview);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newReview);
        }

        $manager->flush();
    }
}
