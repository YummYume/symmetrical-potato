<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231116221416 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add objectives to heist and is_verified and is_dead to user.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE heist ADD objectives JSON NOT NULL COMMENT \'(DC2Type:json)\', ADD max_objectives INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user ADD is_verified TINYINT(1) NOT NULL, ADD is_dead TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user DROP is_verified, DROP is_dead');
        $this->addSql('ALTER TABLE heist DROP objectives, DROP max_objectives');
    }
}
