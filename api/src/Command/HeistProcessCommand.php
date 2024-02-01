<?php

namespace App\Command;

use App\Entity\CrewMember;
use App\Entity\Heist;
use App\Entity\User;
use App\Enum\CrewMemberStatusEnum;
use App\Enum\HeistCancellationReasonEnum;
use App\Enum\HeistDifficultyEnum;
use App\Enum\HeistPhaseEnum;
use App\Enum\HeistPreferedTacticEnum;
use App\Repository\HeistRepository;
use App\Service\Mailer;
use Doctrine\ORM\EntityManagerInterface;
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
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HeistRepository $heistRepository,
        private readonly Mailer $mailer
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $io->title('Processing ongoing and unprocessed heists...');

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
                        // Cancel heists with no crew members, otherwise set them to in progress
                        if ($ongoingHeist->getCrewMembers()->isEmpty() || null === $ongoingHeist->getEmployee()) {
                            $ongoingHeist->setPhase(HeistPhaseEnum::Cancelled);

                            $this->mailer->sendHeistCancelledEmail(
                                $ongoingHeist,
                                $ongoingHeist->getEstablishment()->getContractor(),
                                $ongoingHeist->getCrewMembers()->isEmpty() ? HeistCancellationReasonEnum::NoCrewMember : HeistCancellationReasonEnum::NoEmployee
                            );
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
                $io->newLine();

                $io->success(sprintf('Processed %s/%s heist(s).', $processedHeists, \count($ongoingHeists)));
            }

            $io->title('Processing finished and unprocessed heists...');

            $finishedHeists = $this->heistRepository->findUnprocessedFinishedHeists();

            if (empty($finishedHeists)) {
                $io->info('No finished heists found. Skipping...');
            } else {
                $processedHeists = 0;
                $heistsCount = \count($finishedHeists);
                $progressBar = $io->createProgressBar(\count($finishedHeists));

                $io->info(sprintf('Found %d finished and unprocessed heist(s).', $heistsCount));
                $progressBar->start();

                foreach ($finishedHeists as $finishedHeist) {
                    try {
                        // Cancel heists with no crew members, otherwise randomly process them
                        if ($finishedHeist->getCrewMembers()->isEmpty()) {
                            $finishedHeist->setPhase(HeistPhaseEnum::Cancelled);
                        } else {
                            $this->randomlyProcessHeist($finishedHeist);
                        }

                        ++$processedHeists;
                    } catch (\Exception $e) {
                        $io->error(sprintf('Failed to process heist "%s": %s', $finishedHeist->getId(), $e->getMessage()));
                    }

                    $progressBar->advance();
                }

                $this->entityManager->flush();
                $progressBar->finish();
                $io->newLine();

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
        $crewMemberCount = $heist->getCrewMembers()->count();
        // Lower difficulty means more chances of success
        $phaseDifficultyMatcher = match ($heist->getDifficulty()) {
            HeistDifficultyEnum::Normal => 0,
            HeistDifficultyEnum::Hard => 1,
            HeistDifficultyEnum::VeryHard => 2,
            HeistDifficultyEnum::Overkill => 3,
        };
        // More crew members means more chances of success
        $phase = $crewMemberCount >= random_int(1, Heist::MAX_ALLOWED_CREW_MEMBERS + $phaseDifficultyMatcher)
            ? HeistPhaseEnum::Succeeded
            : HeistPhaseEnum::Failed
        ;
        $establishment = $heist->getEstablishment();

        $heist
            ->setPhase($phase)
            ->setEndedAt(new \DateTimeImmutable())
        ;

        if (HeistPhaseEnum::Succeeded === $phase) {
            // If the heist is successful
            $payout = $this->randomFloat($heist->getMinimumPayout(), $heist->getMaximumPayout());

            // Pay the contractor
            $contractorPayout = $payout * $establishment->getContractorCut() / 100;
            $establishment->getContractor()->setBalance(
                round($establishment->getContractor()->getBalance() + $contractorPayout, 2)
            );

            $this->entityManager->persist($establishment->getContractor());
            $this->mailer->sendHeistSucceededEmail($heist, $establishment->getContractor(), $contractorPayout);

            // Pay the employee
            if (null !== $heist->getEmployee()?->getUser()) {
                $employeePayout = $payout * $establishment->getEmployeeCut() / 100;
                $heist->getEmployee()->getUser()->setBalance(
                    round($heist->getEmployee()->getUser()->getBalance() + $employeePayout, 2)
                );

                $this->entityManager->persist($heist->getEmployee()->getUser());
                $this->mailer->sendHeistSucceededEmail($heist, $heist->getEmployee()->getUser(), $employeePayout);
            }

            // Pay each crew member
            foreach ($heist->getCrewMembers() as $crewMember) {
                // 10% chance of being jailed
                $isJailed = random_int(0, 100) < 10;
                // Crew members get half the payout if they are jailed
                $memberPayout = $payout * ($establishment->getHeisterCut() / 100) * ($isJailed ? 0.5 : 1);
                // Randomly generate the number of completed objectives
                $objectivesCompleted = $this->randomlyGenerateCompletedObjectives($heist);
                // Randomly generate the number of civilian casualties
                $civilianCasualties = $this->randomlyGenerateCivilianCasualties($heist);
                // Randomly generate the number of cop kills
                $copKills = $this->randomlyGenerateCopKills($heist);

                // Cleanup costs for civilian casualties
                if ($civilianCasualties > 0) {
                    $memberPayout -= Heist::CIVILIAN_CLEANUP_COST * $civilianCasualties;
                }

                // If the user has debts, they will only get 75% of the payout
                if ($crewMember->getUser()->getBalance() < 0) {
                    $memberPayout *= 0.75;
                }

                $crewMember
                    ->setStatus($isJailed ? CrewMemberStatusEnum::Jailed : CrewMemberStatusEnum::Free)
                    ->setPayout(round($memberPayout, 2))
                    ->setObjectivesCompleted($objectivesCompleted)
                    ->setCivilianCasualties($civilianCasualties)
                    ->setKills($copKills)
                ;
                // Update the user's balance
                $crewMember->getUser()->setBalance(round($crewMember->getUser()->getBalance() + $memberPayout, 2));

                $this->entityManager->persist($crewMember);
                $this->mailer->sendHeistSucceededCrewMemberEmail($crewMember);
            }
        } else {
            // If the heist failed
            $this->mailer->sendHeistFailedEmail($heist, $establishment->getContractor());

            if (null !== $heist->getEmployee()?->getUser()) {
                $this->mailer->sendHeistFailedEmail($heist, $heist->getEmployee()->getUser());
            }

            foreach ($heist->getCrewMembers() as $crewMember) {
                // 5% chance of dying
                $isDead = random_int(0, 100) <= 5;
                // Randomly generate the number of completed objectives
                $objectivesCompleted = $this->randomlyGenerateCompletedObjectives($heist);
                // Randomly generate the number of civilian casualties
                $civilianCasualties = $this->randomlyGenerateCivilianCasualties($heist);
                // Randomly generate the number of cop kills
                $copKills = $this->randomlyGenerateCopKills($heist);

                $crewMember
                    ->setObjectivesCompleted($objectivesCompleted)
                    ->setCivilianCasualties($civilianCasualties)
                    ->setKills($copKills)
                ;

                // Cleanup costs for civilian casualties
                $crewMember->getUser()->setBalance(
                    round($crewMember->getUser()->getBalance() - (Heist::CIVILIAN_CLEANUP_COST * $civilianCasualties), 2)
                );

                // If the crew member died, they will have to pay for their own revival
                if ($isDead) {
                    $crewMember
                        ->setStatus(CrewMemberStatusEnum::Dead)
                        ->setPayout(round(-CrewMember::REVIVE_COST, 2))
                    ;
                    // Update the user's balance
                    $crewMember->getUser()->setBalance(round($crewMember->getUser()->getBalance() - CrewMember::REVIVE_COST, 2));
                } else {
                    // 25% chance of being jailed
                    $crewMember->setStatus(random_int(0, 100) > 25 ? CrewMemberStatusEnum::Free : CrewMemberStatusEnum::Jailed);
                }

                $this->entityManager->persist($crewMember);
                $this->entityManager->persist($crewMember->getUser());
                $this->mailer->sendHeistFailedCrewMemberEmail($crewMember);
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
        // If the heist is successful, at least all the required objectives will be completed
        if (HeistPhaseEnum::Succeeded === $heist->getPhase()) {
            if (0 === $heist->getObjectiveCount()) {
                return random_int(1, Heist::MAX_OBJECTIVES_PER_HEIST);
            }

            return random_int($heist->getRequiredObjectiveCount(), $heist->getObjectiveCount());
        }

        // Determine the max number of objectives
        $objectiveCount = $heist->getObjectiveCount();
        $maxObjectives = $objectiveCount > 0 ? $objectiveCount : Heist::MAX_OBJECTIVES_PER_HEIST;
        $objectivesCompleted = 0;
        // Completed objectives go up with difficulty
        $difficultyChanceMultiplier = match ($heist->getDifficulty()) {
            HeistDifficultyEnum::Normal => 25,
            HeistDifficultyEnum::Hard => 40,
            HeistDifficultyEnum::VeryHard => 55,
            HeistDifficultyEnum::Overkill => 70,
        };

        // Randomly generate the number of completed objectives (without the last one, which is most likely the escape)
        foreach (range(1, $maxObjectives - 1) as $objective) {
            if (random_int(0, 100) > $difficultyChanceMultiplier) {
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
        // Successfull heists are more likely to have no civilian casualties
        $statusChanceMultiplier = HeistPhaseEnum::Succeeded === $heist->getPhase() ? 1 : 2;
        // Number of civilian casualties goes down with difficulty
        $noCasultyChanceMultiplier = match ($heist->getDifficulty()) {
            HeistDifficultyEnum::Normal => 30,
            HeistDifficultyEnum::Hard => 50,
            HeistDifficultyEnum::VeryHard => 70,
            HeistDifficultyEnum::Overkill => 90,
        };

        // Many times, there will be no civilian casualties
        if (random_int(0, 100) < $noCasultyChanceMultiplier) {
            return 0;
        }

        // Low chance of having many civilian casualties (e.g. launched a grenade in a crowd)
        $maxNumberOfCivilianCasualties = random_int(0, 100) < 10 ? Heist::MAX_CIVILIAN_CASUALTIES_PER_HEIST : Heist::MAX_CIVILIAN_CASUALTIES_PER_HEIST / 2;

        // Number of civilian casualties based on above factors
        return min(random_int(0, $maxNumberOfCivilianCasualties) * $statusChanceMultiplier, Heist::MAX_CIVILIAN_CASUALTIES_PER_HEIST);
    }

    /**
     * Randomly generate the number of cop kills for a heist.
     * Will be based on a number of factors, such as the heist difficulty, if the heist is stealth or not and if the heist was a success or not.
     *
     * @param  Heist $heist the heist to process
     * @return int   the number of cop kills
     */
    private function randomlyGenerateCopKills(Heist $heist): int
    {
        // Successfull heists will have more cop kills
        $statusChanceMultiplier = HeistPhaseEnum::Succeeded === $heist->getPhase() ? 4 : 1;
        // Number of kills ramp up with difficulty
        $minimumCopKills = match ($heist->getDifficulty()) {
            HeistDifficultyEnum::Normal => Heist::MAX_COP_KILLS_PER_HEIST / 10,
            HeistDifficultyEnum::Hard => Heist::MAX_COP_KILLS_PER_HEIST / 8,
            HeistDifficultyEnum::VeryHard => Heist::MAX_COP_KILLS_PER_HEIST / 6,
            HeistDifficultyEnum::Overkill => Heist::MAX_COP_KILLS_PER_HEIST / 4,
        };
        // Total number of kills based on above factors
        $totalKills = random_int($minimumCopKills, Heist::MAX_COP_KILLS_PER_HEIST / 4) * $statusChanceMultiplier;

        // Kills are reduced if the heist is not loud
        return (int) match ($heist->getPreferedTactic()) {
            HeistPreferedTacticEnum::Loud => $totalKills,
            HeistPreferedTacticEnum::SemiStealth => $totalKills * 0.45,
            HeistPreferedTacticEnum::Stealth => min($totalKills * 0.05, 4),
            HeistPreferedTacticEnum::Unknown => $totalKills * $this->randomFloat(0.05, 1.00)
        };
    }

    /**
     * Generate a random float between two numbers.
     *
     * @param  float $min The minimum number
     * @param  float $max The maximum number
     * @return float The random float
     */
    private function randomFloat(float $min, float $max): float
    {
        if ($min > $max) {
            throw new \InvalidArgumentException('The minimum number cannot be greater than the maximum number.');
        }

        return $min + mt_rand() / mt_getrandmax() * ($max - $min);
    }
}
