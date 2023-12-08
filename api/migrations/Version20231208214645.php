<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231208214645 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add missing ON DELETE SET NULL to employee_id foreign keys.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE heist DROP FOREIGN KEY FK_77E4A31F8C03F15C');
        $this->addSql('ALTER TABLE heist ADD CONSTRAINT FK_77E4A31F8C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D6498C03F15C');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D6498C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D6498C03F15C');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D6498C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id)');
        $this->addSql('ALTER TABLE heist DROP FOREIGN KEY FK_77E4A31F8C03F15C');
        $this->addSql('ALTER TABLE heist ADD CONSTRAINT FK_77E4A31F8C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id)');
    }
}
