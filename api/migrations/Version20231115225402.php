<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231115225402 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add contractor, employee and crew cut to establishment.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE establishment ADD contractor_cut DOUBLE PRECISION NOT NULL, ADD employee_cut DOUBLE PRECISION NOT NULL, ADD crew_cut DOUBLE PRECISION NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE establishment DROP contractor_cut, DROP employee_cut, DROP crew_cut');
    }
}
