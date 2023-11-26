<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231126161645 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add review count and average rating to establishment and location.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE establishment ADD review_count INT NOT NULL, ADD average_rating DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE location ADD review_count INT NOT NULL, ADD average_rating DOUBLE PRECISION DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE establishment DROP review_count, DROP average_rating');
        $this->addSql('ALTER TABLE location DROP review_count, DROP average_rating');
    }
}
