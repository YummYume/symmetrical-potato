<?php

namespace App\Command;

use App\Entity\CrewMember;
use App\Entity\Heist;
use App\Enum\CrewMemberStatusEnum;
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

    // TODO cancelled heists
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

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
                    $ongoingHeist->setPhase(HeistPhaseEnum::InProgress);
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
                    $this->randomlyProcessHeist($finishedHeist);
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
        // TODO ratio crew member
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
                $memberPayout = $payout * $establishment->getHeisterCut() / ($isJailed ? 100 : 200);

                $crewMember
                    ->setStatus($isJailed ? CrewMemberStatusEnum::Free : CrewMemberStatusEnum::Jailed)
                    ->setPayout($memberPayout)
                ;
                $crewMember->getUser()->setBalance($crewMember->getUser()->getBalance() + $memberPayout);

                $this->entityManager->persist($crewMember);
            }
        } else {
            foreach ($heist->getCrewMembers() as $crewMember) {
                $isDead = random_int(0, 100) > 5;

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
}
