<?php

namespace App\Command;

use App\Entity\Review;
use App\Enum\ReviewRatingEnum;
use App\Repository\EstablishmentRepository;
use App\Repository\LocationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:review:process',
    description: 'Processes reviews for establishments and locations.',
    aliases: ['a:r:p']
)]
final class ProcessReviewCommand extends Command
{
    public function __construct(
        private readonly EstablishmentRepository $establishmentRepository,
        private readonly LocationRepository $locationRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $io->title('Processing reviews for establishments...');

            $establishments = $this->establishmentRepository->findAll();

            if (empty($establishments)) {
                $io->info('No establishments found. Skipping...');
            } else {
                $processed = 0;

                foreach ($establishments as $establishment) {
                    $reviews = $establishment->getReviews();
                    $reviewCount = $reviews->count();

                    if (0 === $reviewCount) {
                        $establishment
                            ->setAverageRating(null)
                            ->setReviewCount(0)
                        ;
                    } else {
                        $averageRating = array_reduce(
                            $reviews->toArray(),
                            static fn (float $carry, Review $review) => $carry + ReviewRatingEnum::getRatingValue($review->getRating()),
                            0
                        ) / $reviewCount;

                        $establishment
                            ->setAverageRating(min(max(round($averageRating, 2), 0), 5))
                            ->setReviewCount($reviewCount)
                        ;
                    }

                    $this->entityManager->persist($establishment);
                    ++$processed;
                }

                $this->entityManager->flush();

                $io->success(sprintf('Processed %d establishments.', $processed));
            }

            $io->title('Processing reviews for locations...');

            $locations = $this->locationRepository->findAll();

            if (empty($locations)) {
                $io->info('No locations found. Skipping...');
            } else {
                $processed = 0;

                foreach ($locations as $location) {
                    $reviews = $location->getReviews();
                    $reviewCount = $reviews->count();

                    if (0 === $reviewCount) {
                        $location
                            ->setAverageRating(null)
                            ->setReviewCount(0)
                        ;
                    } else {
                        $averageRating = array_reduce(
                            $reviews->toArray(),
                            static fn (float $carry, Review $review) => $carry + ReviewRatingEnum::getRatingValue($review->getRating()),
                            0
                        ) / $reviewCount;

                        $location
                            ->setAverageRating(min(max(round($averageRating, 2), 0), 5))
                            ->setReviewCount($reviewCount)
                        ;
                    }

                    $this->entityManager->persist($location);
                    ++$processed;
                }

                $this->entityManager->flush();

                $io->success(sprintf('Processed %d locations.', $processed));
            }

            $io->success('All reviews processed.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error(sprintf('Failed to process reviews: %s', $e->getMessage()));

            return Command::FAILURE;
        }
    }
}
