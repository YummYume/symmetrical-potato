<?php

namespace App\Command;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:user-rating:compute',
    description: "Computes users' global rating depending on all their heists.",
    aliases: ['a:u:c']
)]
final class ComputeUserRatingCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Computing user ratios...');

        try {
            $usersWithHeists = $this->userRepository->findUsersWithHeists();

            if (0 === \count($usersWithHeists)) {
                $io->warning('No users with heists found.');

                return Command::SUCCESS;
            }

            $progressBar = $io->createProgressBar(\count($usersWithHeists));

            foreach ($usersWithHeists as $user) {
                $user->computeGlobalRating();

                $this->entityManager->persist($user);
                $progressBar->advance();
            }

            $this->entityManager->flush();
            $progressBar->finish();
            $io->newLine();

            $io->success('User ratios computed.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error(sprintf('An error occurred: %s', $e->getMessage()));

            return Command::FAILURE;
        }
    }
}
