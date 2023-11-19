<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Enum\UserLocaleEnum;
use App\Enum\UserStatusEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserFixtures extends Fixture
{
    // Heisters
    public const HEISTER_DALLAS = 'dallas';
    public const HEISTER_HOXTON = 'hoxton';
    public const HEISTER_CHAINS = 'chains';
    public const HEISTER_WOLF = 'wolf';
    public const HEISTER_JOY = 'joy';
    public const HEISTER_PEARL = 'pearl';

    // Employees
    // Accepted
    public const EMPLOYEE_BILE = 'bile';
    public const EMPLOYEE_BOB = 'bob';
    public const EMPLOYEE_INFILTRATED_CIVILIAN = 'infiltrated_civilian';
    public const EMPLOYEE_FAKE_COP = 'fake_cop';
    public const EMPLOYEE_FAKE_GUARD = 'fake_guard';
    public const EMPLOYEE_POLLING_MAN = 'polling_man';
    public const EMPLOYEE_GANG_MEMBER = 'gang_member';
    // Pending
    public const EMPLOYEE_PENDING = 'pending_employee';

    // Contractors
    // Accepted
    public const CONTRACTOR_SHADE = 'shade';
    public const CONTRACTOR_SHAYU = 'shayu';
    public const CONTRACTOR_BUTCHER = 'butcher';
    public const CONTRACTOR_VLAD = 'vlad';
    public const CONTRACTOR_BECKETT = 'beckett';
    public const CONTRACTOR_MAC = 'mac';
    public const CONTRACTOR_KEEGAN = 'keegan';
    // Pending
    public const CONTRACTOR_PENDING = 'pending_contractor';
    // Rejected
    public const CONTRACTOR_REJECTED = 'rejected_contractor';

    // Admin
    // RIP Bain :(
    public const ADMIN_BAIN = 'bain';

    public const DEFAULT_PASSWORD = 'xxx';
    public const REFERENCE_IDENTIFIER = 'user_';
    public const DATA = [
        self::HEISTER_DALLAS => ['role' => User::ROLE_HEISTER],
        self::HEISTER_HOXTON => ['role' => User::ROLE_HEISTER],
        self::HEISTER_CHAINS => ['role' => User::ROLE_HEISTER],
        self::HEISTER_WOLF => ['role' => User::ROLE_HEISTER],
        self::HEISTER_JOY => ['role' => User::ROLE_HEISTER],
        self::HEISTER_PEARL => ['role' => User::ROLE_HEISTER],
        self::EMPLOYEE_BILE => ['role' => User::ROLE_EMPLOYEE],
        self::EMPLOYEE_BOB => ['role' => User::ROLE_EMPLOYEE],
        self::EMPLOYEE_INFILTRATED_CIVILIAN => ['role' => User::ROLE_EMPLOYEE],
        self::EMPLOYEE_FAKE_COP => ['role' => User::ROLE_EMPLOYEE],
        self::EMPLOYEE_FAKE_GUARD => ['role' => User::ROLE_EMPLOYEE],
        self::EMPLOYEE_POLLING_MAN => ['role' => User::ROLE_EMPLOYEE],
        self::EMPLOYEE_GANG_MEMBER => ['role' => User::ROLE_EMPLOYEE],
        self::EMPLOYEE_PENDING => ['role' => User::ROLE_EMPLOYEE],
        self::CONTRACTOR_SHADE => ['role' => User::ROLE_CONTRACTOR],
        self::CONTRACTOR_SHAYU => ['role' => User::ROLE_CONTRACTOR],
        self::CONTRACTOR_BUTCHER => ['role' => User::ROLE_CONTRACTOR],
        self::CONTRACTOR_VLAD => ['role' => User::ROLE_CONTRACTOR],
        self::CONTRACTOR_BECKETT => ['role' => User::ROLE_CONTRACTOR],
        self::CONTRACTOR_MAC => ['role' => User::ROLE_CONTRACTOR],
        self::CONTRACTOR_KEEGAN => ['role' => User::ROLE_CONTRACTOR],
        self::CONTRACTOR_PENDING => ['role' => User::ROLE_CONTRACTOR],
        self::CONTRACTOR_REJECTED => ['role' => User::ROLE_CONTRACTOR],
        self::ADMIN_BAIN => ['role' => User::ROLE_ADMIN],
    ];

    public function __construct(private readonly UserPasswordHasherInterface $passwordHasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $user) {
            $newUser = new User();
            $newUser
                ->setUsername($key)
                ->setEmail(sprintf('%s%s', $key, '@sp.com'))
                ->setPassword($this->passwordHasher->hashPassword($newUser, self::DEFAULT_PASSWORD))
                ->addRole($user['role'])
                ->setLocale(UserLocaleEnum::random())
                ->setBalance(random_int(0, 100000) * 0.75)
                ->setStatus(UserStatusEnum::Verified)
            ;

            $manager->persist($newUser);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newUser);
        }

        $manager->flush();
    }
}
