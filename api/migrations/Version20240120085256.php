<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240120085256 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set contractor_request_id in user table to null on delete.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D6491BF8D8CE');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D6491BF8D8CE FOREIGN KEY (contractor_request_id) REFERENCES contractor_request (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D6491BF8D8CE');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D6491BF8D8CE FOREIGN KEY (contractor_request_id) REFERENCES contractor_request (id)');
    }
}
