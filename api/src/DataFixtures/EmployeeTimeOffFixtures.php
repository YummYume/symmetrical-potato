<?php

namespace App\DataFixtures;

use App\Entity\Employee;
use App\Entity\EmployeeTimeOff;
use App\Enum\EmployeeTimeOffReasonEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

final class EmployeeTimeOffFixtures extends Fixture implements DependentFixtureInterface
{
    public const REFERENCE_IDENTIFIER = 'employee-time-off_';
    public const DATA = [
        [
            'description' => "I need to take a day off. I can't say why.",
            'employee' => UserFixtures::EMPLOYEE_BOB,
            'reason' => EmployeeTimeOffReasonEnum::Other,
            'startAt' => '2023-11-24 09:00:00',
            'endAt' => '2023-11-24 10:00:00',
        ],
        [
            'description' => 'I used too much data to poll the API.',
            'employee' => UserFixtures::EMPLOYEE_POLLING_MAN,
            'reason' => EmployeeTimeOffReasonEnum::MedicalLeave,
            'startAt' => '2023-11-02 09:00:00',
            'endAt' => '2023-11-02 12:00:00',
        ],
    ];

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            EmployeeFixtures::class,
        ];
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $employeeTimeOff) {
            /** @var Employee $employee */
            $employee = $this->getReference(EmployeeFixtures::REFERENCE_IDENTIFIER.$employeeTimeOff['employee'], Employee::class);
            $newEmployeeTimeOff = (new EmployeeTimeOff())
                ->setDescription($employeeTimeOff['description'])
                ->setEmployee($employee)
                ->setReason($employeeTimeOff['reason'])
                ->setStartAt(new \DateTime($employeeTimeOff['startAt']))
                ->setEndAt(new \DateTime($employeeTimeOff['endAt']))
            ;

            $manager->persist($newEmployeeTimeOff);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newEmployeeTimeOff);
        }

        $manager->flush();
    }
}
