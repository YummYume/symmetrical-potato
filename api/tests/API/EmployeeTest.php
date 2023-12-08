<?php

namespace App\Tests\API;

use App\Entity\Employee;
use App\Entity\Establishment;
use App\Tests\AbstractTestCase;

final class EmployeeTest extends AbstractTestCase
{
    public const FOURTHY_HOURS_SCHEDULE = '
        {
            monday: [
                {
                    startAt: "07:00"
                    endAt: "18:00"
                }
            ]
            tuesday: [
                {
                    startAt: "07:00"
                    endAt: "18:00"
                }
            ]
            wednesday: [
                {
                    startAt: "07:00"
                    endAt: "18:00"
                }
            ]
            thursday: [
                {
                    startAt: "07:00"
                    endAt: "18:00"
                }
            ]
            friday: []
            saturday: []
            sunday: []
        }
    ';
    public const TWENTY_HOURS_SCHEDULE = '
        {
            monday: [
                {
                    startAt: "07:00"
                    endAt: "12:00"
                }
            ]
            tuesday: [
                {
                    startAt: "07:00"
                    endAt: "12:00"
                }
            ]
            wednesday: [
                {
                    startAt: "07:00"
                    endAt: "12:00"
                }
            ]
            thursday: [
                {
                    startAt: "07:00"
                    endAt: "12:00"
                }
            ]
            friday: []
            saturday: []
            sunday: []
        }
    ';

    /**
     * Tests if a heister (normal user) can apply to an establishment.
     */
    public function testUserCanApplyToEstablishment(): void
    {
        $establishmentId = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createEmployee(input: {
                        establishment: "%s"
                        motivation: "I want to help other heisters."
                        weeklySchedule: %s
                    }) {
                        employee {
                            motivation
                        }
                    }
                }', $establishmentId, self::FOURTHY_HOURS_SCHEDULE),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'createEmployee' => [
                    'employee' => [
                        'motivation' => 'I want to help other heisters.',
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if a heister (normal user) cannot apply to an establishment with less than the minimum hours of work required.
     */
    public function testUserCannotApplyToEstablishmentWithLessThanMinimumHours(): void
    {
        $establishmentId = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient();
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createEmployee(input: {
                        establishment: "%s"
                        motivation: "I want to help other heisters."
                        weeklySchedule: %s
                    }) {
                        employee {
                            id
                        }
                    }
                }', $establishmentId, self::TWENTY_HOURS_SCHEDULE),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createEmployee']['employee'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if an active employee cannot apply to an establishment.
     */
    public function testActiveEmployeeCannotApplyToEstablishment(): void
    {
        $establishmentId = $this->findIriBy(Establishment::class, ['name' => 'Rooftop Garden']);

        ['client' => $client] = static::createAuthenticatedClient('bile');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    createEmployee(input: {
                        establishment: "%s"
                        motivation: "I want to help other heisters."
                        weeklySchedule: %s
                    }) {
                        employee {
                            id
                        }
                    }
                }', $establishmentId, self::FOURTHY_HOURS_SCHEDULE),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['createEmployee']['employee'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a contractor can validate an employee.
     */
    public function testContractorCanValidateEmployee(): void
    {
        $employeeId = $this->findIriBy(Employee::class, ['motivation' => 'plz hire me thx']);

        ['client' => $client] = static::createAuthenticatedClient('shade');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    validateEmployee(input: {
                        id: "%s"
                        codeName: "Valid Employee"
                        status: Active
                    }) {
                        employee {
                            id
                        }
                    }
                }', $employeeId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'validateEmployee' => [
                    'employee' => [
                        'id' => $employeeId,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if another contractor cannot validate an employee.
     */
    public function testOtherContractorCannotValidateEmployee(): void
    {
        $employeeId = $this->findIriBy(Employee::class, ['motivation' => 'plz hire me thx']);

        ['client' => $client] = static::createAuthenticatedClient('shayu');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    validateEmployee(input: {
                        id: "%s"
                        codeName: "Valid Employee"
                        status: Active
                    }) {
                        employee {
                            id
                        }
                    }
                }', $employeeId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['validateEmployee']['employee'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if a contractor can reject an employee.
     */
    public function testContractorCanRejectEmployee(): void
    {
        $employeeId = $this->findIriBy(Employee::class, ['motivation' => 'plz hire me thx']);

        ['client' => $client] = static::createAuthenticatedClient('shade');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    validateEmployee(input: {
                        id: "%s"
                        codeName: "Rejected Employee"
                        status: Rejected
                    }) {
                        employee {
                            id
                        }
                    }
                }', $employeeId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'validateEmployee' => [
                    'employee' => [
                        'id' => $employeeId,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if an employee can update their description.
     */
    public function testEmployeeCanUpdateDescription(): void
    {
        $employeeId = $this->findIriBy(Employee::class, ['codeName' => 'Bile']);

        ['client' => $client] = static::createAuthenticatedClient('bile');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateEmployee(input: {id: "%s", description: "My new description !"}) {
                        employee {
                            id
                            description
                        }
                    }
                }', $employeeId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'updateEmployee' => [
                    'employee' => [
                        'id' => $employeeId,
                        'description' => 'My new description !',
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if an employee cannot update another employee's description.
     */
    public function testEmployeeCannotUpdateAnotherEmployeeDescription(): void
    {
        $employeeId = $this->findIriBy(Employee::class, ['codeName' => 'Bile']);

        ['client' => $client] = static::createAuthenticatedClient('polling_man');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    updateEmployee(input: {id: "%s", description: "My new description !"}) {
                        employee {
                            id
                            description
                        }
                    }
                }', $employeeId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['updateEmployee']['employee'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * Tests if an employee can leave an establishment.
     */
    public function testEmployeeCanLeaveEstablishment(): void
    {
        $employeeId = $this->findIriBy(Employee::class, ['codeName' => 'Bile']);

        ['client' => $client] = static::createAuthenticatedClient('bile');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    deleteEmployee(input: {id: "%s"}) {
                        employee {
                            id
                        }
                    }
                }', $employeeId),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'data' => [
                'deleteEmployee' => [
                    'employee' => [
                        'id' => $employeeId,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Tests if an employee cannot leave another employee's establishment.
     */
    public function testEmployeeCannotLeaveAnotherEmployeeEstablishment(): void
    {
        $employeeId = $this->findIriBy(Employee::class, ['codeName' => 'Gang Member']);

        ['client' => $client] = static::createAuthenticatedClient('bile');
        $client->request('POST', '/graphql', [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => sprintf('mutation {
                    deleteEmployee(input: {id: "%s"}) {
                        employee {
                            id
                        }
                    }
                }', $employeeId),
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayNotHasKey('id', $data['data']['deleteEmployee']['employee'] ?? []);
        $this->assertArrayHasKey('errors', $data);
    }
}
