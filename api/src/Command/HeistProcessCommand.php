<?php

namespace App\Command;

use App\Entity\CrewMember;
use App\Entity\Heist;
use App\Enum\CrewMemberStatusEnum;
use App\Enum\HeistDifficultyEnum;
use App\Enum\HeistPhaseEnum;
use App\Repository\HeistRepository;
use Doctrine\ORM\EntityManagerInterface;
use Random\Randomizer;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:heist:process',
    description: 'Process finished and ongoing heists.',
    aliases: ['a:h:p']
)]
final class HeistProcessCommand extends Command
{
    private Randomizer $randomizer;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HeistRepository $heistRepository,
    ) {
        parent::__construct();

        $this->randomizer = new Randomizer();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Processing ongoing and unprocessed heists...');

        try {
            $ongoingHeists = $this->heistRepository->findUnprocessedOngoingHeists();

            if (empty($ongoingHeists)) {
                $io->info('No ongoing heists found. Skipping...');
            } else {
                $processedHeists = 0;
                $heistsCount = \count($ongoingHeists);
                $progressBar = $io->createProgressBar(\count($ongoingHeists));

                $io->info(sprintf('Found %d ongoing and unprocessed heist(s).', $heistsCount));
                $progressBar->start();

                foreach ($ongoingHeists as $ongoingHeist) {
                    try {
                        if ($ongoingHeist->getCrewMembers()->isEmpty()) {
                            $ongoingHeist->setPhase(HeistPhaseEnum::Cancelled);
                        } else {
                            $ongoingHeist->setPhase(HeistPhaseEnum::InProgress);
                        }

                        ++$processedHeists;
                    } catch (\Exception $e) {
                        $io->error(sprintf('Failed to process heist "%s": %s', $ongoingHeist->getId(), $e->getMessage()));
                    }

                    $progressBar->advance();
                }

                $this->entityManager->flush();
                $progressBar->finish();

                $io->success(sprintf('Processed %s/%s heist(s).', $processedHeists, \count($ongoingHeists)));
            }

            $io->title('Processing finished and unprocessed heists...');

            $finishedHeists = $this->heistRepository->findUnprocessedFinishedHeists();

            if (empty($ongoingHeists)) {
                $io->info('No finished heists found. Skipping...');
            } else {
                $processedHeists = 0;
                $heistsCount = \count($finishedHeists);
                $progressBar = $io->createProgressBar(\count($finishedHeists));

                $io->info(sprintf('Found %d finished and unprocessed heist(s).', $heistsCount));
                $progressBar->start();

                foreach ($finishedHeists as $finishedHeist) {
                    try {
                        if ($finishedHeist->getCrewMembers()->isEmpty()) {
                            $finishedHeist->setPhase(HeistPhaseEnum::Cancelled);
                        } else {
                            $this->randomlyProcessHeist($finishedHeist);
                        }

                        ++$processedHeists;
                    } catch (\Exception $e) {
                        $io->error(sprintf('Failed to process heist "%s": %s', $ongoingHeist->getId(), $e->getMessage()));
                    }

                    $progressBar->advance();
                }

                $this->entityManager->flush();
                $progressBar->finish();

                $io->success(sprintf('Processed %s/%s heist(s).', $processedHeists, \count($finishedHeists)));
            }

            $io->success('All heists processed.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error(sprintf('Failed to process heists: %s', $e->getMessage()));

            return Command::FAILURE;
        }
    }

    /**
     * Randomly process a heist (success or failure).
     *
     * @param Heist $heist the heist to process
     */
    private function randomlyProcessHeist(Heist $heist): void
    {
        $phase = 1 === random_int(0, 1) ? HeistPhaseEnum::Succeeded : HeistPhaseEnum::Failed;
        $establishment = $heist->getEstablishment();

        $heist
            ->setPhase($phase)
            ->setEndedAt(new \DateTimeImmutable())
        ;

        // TODO emails
        if (HeistPhaseEnum::Succeeded === $phase) {
            $payout = $this->randomizer->getFloat($heist->getMinimumPayout(), $heist->getMaximumPayout());

            $establishment->getContractor()->setBalance(
                $establishment->getContractor()->getBalance() + ($payout * $establishment->getCrewCut() / 100)
            );
            $heist->getEmployee()->getUser()->setBalance(
                $heist->getEmployee()->getUser()->getBalance() + ($payout * $establishment->getEmployeeCut() / 100)
            );

            $this->entityManager->persist($establishment->getContractor());
            $this->entityManager->persist($heist->getEmployee());

            foreach ($heist->getCrewMembers() as $crewMember) {
                $isJailed = random_int(0, 100) > 10;
                $memberPayout = $payout * ($establishment->getHeisterCut() / ($isJailed ? 100 : 200));
                $objectivesCompleted = $this->randomlyGenerateCompletedObjectives($heist);
                $civilianCasualties = $this->randomlyGenerateCivilianCasualties($heist);
                $copKills = $this->randomlyGenerateCopKills($heist);

                if ($crewMember->getUser()->getBalance() < 0) {
                    $memberPayout * 0.25;
                }

                $crewMember
                    ->setStatus($isJailed ? CrewMemberStatusEnum::Free : CrewMemberStatusEnum::Jailed)
                    ->setPayout($memberPayout)
                    ->setObjectivesCompleted($objectivesCompleted)
                    ->setCivilianCasualties($civilianCasualties)
                    ->setKills($copKills)
                ;
                $crewMember->getUser()->setBalance($crewMember->getUser()->getBalance() + $memberPayout);

                $this->entityManager->persist($crewMember);
            }
        } else {
            foreach ($heist->getCrewMembers() as $crewMember) {
                $isDead = random_int(0, 100) > 5;
                $objectivesCompleted = $this->randomlyGenerateCompletedObjectives($heist);
                $civilianCasualties = $this->randomlyGenerateCivilianCasualties($heist);
                $copKills = $this->randomlyGenerateCopKills($heist);

                $crewMember
                    ->setObjectivesCompleted($objectivesCompleted)
                    ->setCivilianCasualties($civilianCasualties)
                    ->setKills($copKills)
                ;

                if ($isDead) {
                    $crewMember
                        ->setStatus(CrewMemberStatusEnum::Dead)
                        ->setPayout(-CrewMember::REVIVE_COST)
                    ;
                    $crewMember->getUser()->setBalance($crewMember->getUser()->getBalance() - CrewMember::REVIVE_COST);
                } else {
                    $crewMember->setStatus(random_int(0, 100) > 10 ? CrewMemberStatusEnum::Free : CrewMemberStatusEnum::Jailed);
                }

                $this->entityManager->persist($crewMember);
                $this->entityManager->persist($crewMember->getUser());
            }
        }
    }

    /**
     * Randomly generate the number of completed objectives for a crew member.
     * Will be based on a number of factors, such as the heist difficulty, the max number of objectives and if the heist was a success or not.
     *
     * @param  Heist $heist the heist to process
     * @return int   the number of completed objectives
     */
    private function randomlyGenerateCompletedObjectives(Heist $heist): int
    {
        $maxObjectives = $heist->getMaxObjectives() ?? Heist::MAX_OBJECTIVES_PER_HEIST;
        $objectivesCompleted = 0;
        $statusChanceMultiplier = HeistPhaseEnum::Succeeded === $heist->getPhase() ? 20 : 0;
        $difficultyChanceMultiplier = match ($heist->getDifficulty()) {
            HeistDifficultyEnum::Normal => 25,
            HeistDifficultyEnum::Hard => 40,
            HeistDifficultyEnum::VeryHard => 55,
            HeistDifficultyEnum::Overkill => 70,
        };

        foreach (range(1, $maxObjectives) as $objective) {
            if (random_int(0, 100) > $statusChanceMultiplier + $difficultyChanceMultiplier) {
                ++$objectivesCompleted;
            }
        }

        return $objectivesCompleted;
    }

    /**
     * Randomly generate the number of civilian casualties for a heist.
     * Will be based on a number of factors, such as the heist difficulty and if the heist was a success or not.
     *
     * @param  Heist $heist the heist to process
     * @return int   the number of civilian casualties
     */
    private function randomlyGenerateCivilianCasualties(Heist $heist): int
    {
        $statusChanceMultiplier = HeistPhaseEnum::Succeeded === $heist->getPhase() ? 1 : 2;
        $noCasultyChanceMultiplier = match ($heist->getDifficulty()) {
            HeistDifficultyEnum::Normal => 30,
            HeistDifficultyEnum::Hard => 50,
            HeistDifficultyEnum::VeryHard => 70,
            HeistDifficultyEnum::Overkill => 90,
        };

        if (random_int(0, 100) < $noCasultyChanceMultiplier) {
            return 0;
        }

        return random_int(0, Heist::MAX_CIVILIAN_CASUALTIES_PER_HEIST / 2) * $statusChanceMultiplier;
    }

    /**
     * Randomly generate the number of cop kills for a heist.
     * Will be based on a number of factors, such as the heist difficulty and if the heist was a success or not.
     *
     * @param  Heist $heist the heist to process
     * @return int   the number of cop kills
     */
    private function randomlyGenerateCopKills(Heist $heist): int
    {
        $statusChanceMultiplier = HeistPhaseEnum::Succeeded === $heist->getPhase() ? 1 : 4;
        $minimumCopKills = match ($heist->getDifficulty()) {
            HeistDifficultyEnum::Normal => Heist::MAX_COP_KILLS_PER_HEIST / 10,
            HeistDifficultyEnum::Hard => Heist::MAX_COP_KILLS_PER_HEIST / 8,
            HeistDifficultyEnum::VeryHard => Heist::MAX_COP_KILLS_PER_HEIST / 6,
            HeistDifficultyEnum::Overkill => Heist::MAX_COP_KILLS_PER_HEIST / 4,
        };

        return random_int($minimumCopKills, Heist::MAX_COP_KILLS_PER_HEIST / 4) * $statusChanceMultiplier;
    }
}
