<?php

namespace App\DataFixtures;

use App\Entity\Employee;
use App\Entity\Establishment;
use App\Entity\User;
use App\Enum\EmployeeStatusEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

final class EmployeeFixtures extends Fixture implements DependentFixtureInterface
{
    public const REFERENCE_IDENTIFIER = 'employee_';
    public const DATA = [
        UserFixtures::EMPLOYEE_BILE => [
            'codeName' => 'Bile',
            'description' => 'The best helicopter pilot in the world. He can get you in and out of any heist. He will also make sure any equipment you need during the heist gets delivered safely.',
            'motivation' => "I'm the best pilot in the world. You can ask Bain.",
            'status' => EmployeeStatusEnum::Active,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
            // 40 hours per week
            'weeklySchedule' => [
                Employee::DAY_MONDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_TUESDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_WEDNESDAY => [],
                Employee::DAY_THURSDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_FRIDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_SATURDAY => [
                    [
                        'startAt' => '06:00',
                        'endAt' => '10:00',
                    ],
                ],
                Employee::DAY_SUNDAY => [],
            ],
        ],
        UserFixtures::EMPLOYEE_BOB => [
            'codeName' => 'Bob',
            'description' => 'A very experienced driver. He can get you in and out of any heist. He will also make sure any equipment you need during the heist gets delivered safely.',
            'motivation' => "I'm the best driver in the world. I will work for anyone except Hoxton.",
            'status' => EmployeeStatusEnum::Active,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_OLD_WAREHOUSE_RED_HOOK,
            // 40 hours per week
            'weeklySchedule' => [
                Employee::DAY_MONDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_TUESDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_WEDNESDAY => [],
                Employee::DAY_THURSDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_FRIDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_SATURDAY => [
                    [
                        'startAt' => '06:00',
                        'endAt' => '10:00',
                    ],
                ],
                Employee::DAY_SUNDAY => [],
            ],
        ],
        UserFixtures::EMPLOYEE_INFILTRATED_CIVILIAN => [
            'codeName' => 'Infiltrated Civilian',
            'description' => 'A civilian who has infiltrated multiple fancy institutions in New York City. He can get you in and out of any heist. He can easily grant you access to restricted areas.',
            'motivation' => "I'm an infiltrated civilian. I currently have 3 jobs in New York City.",
            'status' => EmployeeStatusEnum::Active,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_CENTRAL_PARK_CAVE,
            // 38 hours per week
            'weeklySchedule' => [
                Employee::DAY_MONDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:00',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:00',
                    ],
                ],
                Employee::DAY_TUESDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:00',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:00',
                    ],
                ],
                Employee::DAY_WEDNESDAY => [],
                Employee::DAY_THURSDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:00',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:00',
                    ],
                ],
                Employee::DAY_FRIDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:00',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:00',
                    ],
                ],
                Employee::DAY_SATURDAY => [
                    [
                        'startAt' => '06:00',
                        'endAt' => '10:00',
                    ],
                ],
                Employee::DAY_SUNDAY => [],
            ],
        ],
        UserFixtures::EMPLOYEE_FAKE_COP => [
            'codeName' => 'Fake Cop',
            'description' => "A fake cop. That's all you need to know.",
            'status' => EmployeeStatusEnum::Active,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_BROWNSTONE_BASEMENT,
            // 40 hours per week
            'weeklySchedule' => [
                Employee::DAY_MONDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_TUESDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_WEDNESDAY => [],
                Employee::DAY_THURSDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_FRIDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '18:00',
                        'endAt' => '23:30',
                    ],
                ],
                Employee::DAY_SATURDAY => [
                    [
                        'startAt' => '06:00',
                        'endAt' => '10:00',
                    ],
                ],
                Employee::DAY_SUNDAY => [],
            ],
        ],
        UserFixtures::EMPLOYEE_FAKE_GUARD => [
            'codeName' => 'Fake Guard',
            'description' => "I'm a fake guard, I can get hired anywhere.",
            'motivation' => 'I can easily get hired anywhere thanks to my non-existent background check.',
            'status' => EmployeeStatusEnum::Active,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_INDUSTRIAL_BUILDING_LONG_ISLAND_CITY,
            // 40 hours per week
            'weeklySchedule' => [
                Employee::DAY_MONDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_TUESDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_WEDNESDAY => [],
                Employee::DAY_THURSDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_FRIDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_SATURDAY => [
                    [
                        'startAt' => '06:00',
                        'endAt' => '10:00',
                    ],
                ],
                Employee::DAY_SUNDAY => [],
            ],
        ],
        UserFixtures::EMPLOYEE_POLLING_MAN => [
            'codeName' => 'Polling Man',
            'description' => 'I can poll data from any establishment in New York City.',
            'motivation' => "I am very good at getting data in real time. And I don't like TypeScript.",
            'status' => EmployeeStatusEnum::Active,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_PRIVATE_LIBRARY,
            // 38 hours per week
            'weeklySchedule' => [
                Employee::DAY_MONDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:00',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:00',
                    ],
                ],
                Employee::DAY_TUESDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:00',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:00',
                    ],
                ],
                Employee::DAY_WEDNESDAY => [],
                Employee::DAY_THURSDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:00',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:00',
                    ],
                ],
                Employee::DAY_FRIDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:00',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:00',
                    ],
                ],
                Employee::DAY_SATURDAY => [
                    [
                        'startAt' => '06:00',
                        'endAt' => '10:00',
                    ],
                ],
                Employee::DAY_SUNDAY => [],
            ],
        ],
        UserFixtures::EMPLOYEE_GANG_MEMBER => [
            'codeName' => 'Gang Member',
            'description' => 'Member of one of the biggest gangs in New York City.',
            'motivation' => "Don't ask anything.",
            'status' => EmployeeStatusEnum::Active,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ABANDONED_SUBWAY_STATION,
            // 40 hours per week
            'weeklySchedule' => [
                Employee::DAY_MONDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_TUESDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_WEDNESDAY => [],
                Employee::DAY_THURSDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_FRIDAY => [
                    [
                        'startAt' => '09:00',
                        'endAt' => '12:30',
                    ],
                    [
                        'startAt' => '14:00',
                        'endAt' => '19:30',
                    ],
                ],
                Employee::DAY_SATURDAY => [
                    [
                        'startAt' => '06:00',
                        'endAt' => '10:00',
                    ],
                ],
                Employee::DAY_SUNDAY => [],
            ],
        ],
        UserFixtures::EMPLOYEE_PENDING => [
            'motivation' => 'plz hire me thx',
            'status' => EmployeeStatusEnum::Pending,
            'establishment' => EstablishmentFixtures::ESTABLISHMENT_ROOFTOP_GARDEN,
        ],
    ];

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            EstablishmentFixtures::class,
        ];
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $employee) {
            /** @var Establishment $establishment */
            $establishment = $this->getReference(EstablishmentFixtures::REFERENCE_IDENTIFIER.$employee['establishment'], Establishment::class);
            /** @var User $user */
            $user = $this->getReference(UserFixtures::REFERENCE_IDENTIFIER.$key, User::class);
            $newEmployee = (new Employee())
                ->setCodeName($employee['codeName'] ?? null)
                ->setDescription($employee['description'] ?? null)
                ->setMotivation($employee['motivation'] ?? null)
                ->setStatus($employee['status'])
                ->setWeeklySchedule($employee['weeklySchedule'] ?? [])
                ->setEstablishment($establishment)
                ->setUser($user)
            ;

            $manager->persist($newEmployee);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newEmployee);
        }

        $manager->flush();
    }
}
