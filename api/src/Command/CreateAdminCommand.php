<?php

namespace App\Command;

use App\Entity\Profile;
use App\Entity\User;
use App\Enum\UserLocaleEnum;
use App\Enum\UserStatusEnum;
use App\Repository\UserRepository;
use App\Service\Mailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\ConstraintViolationInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[AsCommand(
    name: 'app:create:admin',
    description: 'Creates an admin user.',
    aliases: ['a:c:a']
)]
final class CreateAdminCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly UserRepository $userRepository,
        private readonly ValidatorInterface $validator,
        private readonly Mailer $mailer
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $io->title('Create a new admin user');

            $user = (new User())
                ->addRole(User::ROLE_ADMIN)
                ->setStatus(UserStatusEnum::Verified)
            ;

            $io->section('User details');

            // Username
            $user->setUsername($io->ask('What username do you want to use for this user?', validator: function (?string $username): string {
                $error = $this->validator->validatePropertyValue(User::class, 'username', $username, [User::REGISTER]);

                if (0 !== \count($error)) {
                    throw new \RuntimeException($error->get(0)->getMessage());
                }

                $existingUsername = $this->userRepository->findOneBy(['username' => $username]);

                if (null !== $existingUsername) {
                    throw new \RuntimeException(sprintf('Username "%s" is already taken.', $username));
                }

                return $username;
            }));

            // Email
            $user->setEmail($io->ask('What email do you want to use for this user?', validator: function (?string $email): string {
                $error = $this->validator->validatePropertyValue(User::class, 'email', $email, [User::REGISTER]);

                if (0 !== \count($error)) {
                    throw new \RuntimeException($error->get(0)->getMessage());
                }

                $existingEmail = $this->userRepository->findOneBy(['email' => $email]);

                if (null !== $existingEmail) {
                    throw new \RuntimeException(sprintf('Email "%s" is already taken.', $email));
                }

                return $email;
            }));

            // Password
            $user->setPlainPassword(
                $io->askHidden('What password do you want to use for this user?', validator: function (?string $password): string {
                    $error = $this->validator->validatePropertyValue(User::class, 'plainPassword', $password, [User::REGISTER]);

                    if (0 !== \count($error)) {
                        throw new \RuntimeException($error->get(0)->getMessage());
                    }

                    return $password;
                })
            );

            // Balance
            $user->setBalance($io->ask('What balance do you want this user to start with?', validator: function (?string $balance): int {
                if (!is_numeric($balance)) {
                    throw new \RuntimeException('Balance must be a number.');
                }

                if ($balance < 0) {
                    throw new \RuntimeException("You probably don't want to start with a negative balance.");
                }

                return (int) $balance;
            }));

            // Reason
            $user->setReason($io->ask('What is the reason for the creation of this account?', validator: function (?string $reason): string {
                $error = $this->validator->validatePropertyValue(User::class, 'reason', $reason, [User::REGISTER]);

                if (0 !== \count($error)) {
                    throw new \RuntimeException($error->get(0)->getMessage());
                }

                return $reason;
            }));

            // Locale
            $locale = $io->choice('What locale do you want to use for this user?', ['English', 'Français'], 'English');

            $user->setLocale(match ($locale) {
                'English' => UserLocaleEnum::En,
                'Français' => UserLocaleEnum::Fr,
                default => throw new \RuntimeException(sprintf('Locale "%s" is not supported.', $locale)),
            });

            $io->section('User profile');

            $profile = new Profile();

            $user->setProfile($profile);

            // Description
            $profile->setDescription(
                $io->ask("What description do you want to use for the user's profile?", validator: function (?string $description): ?string {
                    $error = $this->validator->validatePropertyValue(Profile::class, 'description', $description, [Profile::UPDATE]);

                    if (0 !== \count($error)) {
                        throw new \RuntimeException($error->get(0)->getMessage());
                    }

                    return $description;
                })
            );

            $io->info('Creating user...');

            $errors = $this->validator->validate($user, groups: [User::REGISTER]);

            if (0 !== \count($errors)) {
                $io->error(sprintf('Cannot create user "%s" with email "%s":%s',
                    $user->getUsername(),
                    $user->getEmail(),
                    array_reduce(
                        iterator_to_array($errors),
                        static fn (string $carry, ConstraintViolationInterface $error): string => $carry.sprintf('- (%s) %s%s', $error->getPropertyPath(), $error->getMessage(), \PHP_EOL),
                        \PHP_EOL
                    )
                ));

                return Command::FAILURE;
            }

            $user
                ->setPassword($this->passwordHasher->hashPassword($user, $user->getPlainPassword()))
                ->eraseCredentials()
            ;

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            $io->success(sprintf('Admin user "%s" (%s) created!', $user->getUsername(), $user->getEmail()));

            $sendEmail = $io->confirm('Do you want to send an email to the user?', true);

            if ($sendEmail) {
                $this->mailer->sendAccountValidatedEmail($user);

                $io->success('User has been notified by email.');
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error(sprintf('Failed to create admin user: %s', $e->getMessage()));

            return Command::FAILURE;
        }
    }
}
