<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231119113253 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add many-to-many relationship between heist and user (forbidden users in a heist).';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE heist_user (heist_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', user_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', INDEX IDX_A34D87A75376E841 (heist_id), INDEX IDX_A34D87A7A76ED395 (user_id), PRIMARY KEY(heist_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE heist_user ADD CONSTRAINT FK_A34D87A75376E841 FOREIGN KEY (heist_id) REFERENCES heist (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE heist_user ADD CONSTRAINT FK_A34D87A7A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE heist_user DROP FOREIGN KEY FK_A34D87A75376E841');
        $this->addSql('ALTER TABLE heist_user DROP FOREIGN KEY FK_A34D87A7A76ED395');
        $this->addSql('DROP TABLE heist_user');
    }
}
