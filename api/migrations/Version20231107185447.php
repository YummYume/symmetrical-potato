<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231107185447 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial migration.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE asset (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', heist_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', name VARCHAR(150) NOT NULL, price DOUBLE PRECISION NOT NULL, type VARCHAR(50) NOT NULL, description LONGTEXT DEFAULT NULL, max_quantity INT NOT NULL, team_asset TINYINT(1) NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_2AF5A5C5376E841 (heist_id), INDEX IDX_2AF5A5CB03A8386 (created_by_id), INDEX IDX_2AF5A5C896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE contractor_request (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', reason LONGTEXT NOT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_57C594D8B03A8386 (created_by_id), INDEX IDX_57C594D8896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE crew_member (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', user_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', heist_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', civilian_casualties INT NOT NULL, kills INT NOT NULL, objectives_completed INT NOT NULL, payout DOUBLE PRECISION NOT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_F4D78A97A76ED395 (user_id), INDEX IDX_F4D78A975376E841 (heist_id), INDEX IDX_F4D78A97B03A8386 (created_by_id), INDEX IDX_F4D78A97896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE employee (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', establishment_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', weekly_schedule JSON NOT NULL COMMENT \'(DC2Type:json)\', code_name VARCHAR(100) DEFAULT NULL, status VARCHAR(50) NOT NULL, motivation LONGTEXT DEFAULT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_5D9F75A18565851 (establishment_id), INDEX IDX_5D9F75A1B03A8386 (created_by_id), INDEX IDX_5D9F75A1896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE employee_time_off (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', employee_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', description LONGTEXT DEFAULT NULL, start_at DATETIME NOT NULL, end_at DATETIME NOT NULL, reason VARCHAR(50) NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_610267EE8C03F15C (employee_id), INDEX IDX_610267EEB03A8386 (created_by_id), INDEX IDX_610267EE896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE establishment (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', contractor_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', name VARCHAR(150) NOT NULL, description LONGTEXT DEFAULT NULL, minimum_wage DOUBLE PRECISION NOT NULL, minimum_work_time_per_week INT NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_DBEFB1EEB0265DC7 (contractor_id), INDEX IDX_DBEFB1EEB03A8386 (created_by_id), INDEX IDX_DBEFB1EE896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE heist (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', location_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', employee_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', establishment_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', minimum_payout DOUBLE PRECISION NOT NULL, maximum_payout DOUBLE PRECISION NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, start_at DATETIME NOT NULL, should_end_at DATETIME NOT NULL, ended_at DATETIME DEFAULT NULL, prefered_tactic VARCHAR(50) NOT NULL, difficulty VARCHAR(50) NOT NULL, phase VARCHAR(50) NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_77E4A31F64D218E (location_id), INDEX IDX_77E4A31F8C03F15C (employee_id), INDEX IDX_77E4A31F8565851 (establishment_id), INDEX IDX_77E4A31FB03A8386 (created_by_id), INDEX IDX_77E4A31F896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE heist_employee (heist_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', employee_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', INDEX IDX_C52CE2735376E841 (heist_id), INDEX IDX_C52CE2738C03F15C (employee_id), PRIMARY KEY(heist_id, employee_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE heist_forbidden_assets (heist_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', asset_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', INDEX IDX_A5ED21545376E841 (heist_id), INDEX IDX_A5ED21545DA1941 (asset_id), PRIMARY KEY(heist_id, asset_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE heist_asset (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', asset_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', crew_member_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', quantity INT NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_45334B725DA1941 (asset_id), INDEX IDX_45334B7247C65C07 (crew_member_id), INDEX IDX_45334B72B03A8386 (created_by_id), INDEX IDX_45334B72896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE location (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, name VARCHAR(255) NOT NULL, address VARCHAR(255) DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_5E9E89CBB03A8386 (created_by_id), INDEX IDX_5E9E89CB896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE profile (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', description LONGTEXT DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_8157AA0FB03A8386 (created_by_id), INDEX IDX_8157AA0F896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE review (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', user_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', establishment_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', location_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', comment LONGTEXT DEFAULT NULL, rating INT NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_794381C6A76ED395 (user_id), INDEX IDX_794381C68565851 (establishment_id), INDEX IDX_794381C664D218E (location_id), INDEX IDX_794381C6B03A8386 (created_by_id), INDEX IDX_794381C6896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', profile_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', contractor_request_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', employee_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', created_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', updated_by_id BINARY(16) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', username VARCHAR(180) NOT NULL, roles JSON NOT NULL COMMENT \'(DC2Type:json)\', password VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, balance DOUBLE PRECISION NOT NULL, global_rating DOUBLE PRECISION DEFAULT NULL, locale VARCHAR(5) NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D649F85E0677 (username), UNIQUE INDEX UNIQ_8D93D649CCFA12B8 (profile_id), UNIQUE INDEX UNIQ_8D93D6491BF8D8CE (contractor_request_id), UNIQUE INDEX UNIQ_8D93D6498C03F15C (employee_id), INDEX IDX_8D93D649B03A8386 (created_by_id), INDEX IDX_8D93D649896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', available_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', delivered_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE asset ADD CONSTRAINT FK_2AF5A5C5376E841 FOREIGN KEY (heist_id) REFERENCES heist (id)');
        $this->addSql('ALTER TABLE asset ADD CONSTRAINT FK_2AF5A5CB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE asset ADD CONSTRAINT FK_2AF5A5C896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE contractor_request ADD CONSTRAINT FK_57C594D8B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE contractor_request ADD CONSTRAINT FK_57C594D8896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE crew_member ADD CONSTRAINT FK_F4D78A97A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE crew_member ADD CONSTRAINT FK_F4D78A975376E841 FOREIGN KEY (heist_id) REFERENCES heist (id)');
        $this->addSql('ALTER TABLE crew_member ADD CONSTRAINT FK_F4D78A97B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE crew_member ADD CONSTRAINT FK_F4D78A97896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE employee ADD CONSTRAINT FK_5D9F75A18565851 FOREIGN KEY (establishment_id) REFERENCES establishment (id)');
        $this->addSql('ALTER TABLE employee ADD CONSTRAINT FK_5D9F75A1B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE employee ADD CONSTRAINT FK_5D9F75A1896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE employee_time_off ADD CONSTRAINT FK_610267EE8C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id)');
        $this->addSql('ALTER TABLE employee_time_off ADD CONSTRAINT FK_610267EEB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE employee_time_off ADD CONSTRAINT FK_610267EE896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE establishment ADD CONSTRAINT FK_DBEFB1EEB0265DC7 FOREIGN KEY (contractor_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE establishment ADD CONSTRAINT FK_DBEFB1EEB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE establishment ADD CONSTRAINT FK_DBEFB1EE896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE heist ADD CONSTRAINT FK_77E4A31F64D218E FOREIGN KEY (location_id) REFERENCES location (id)');
        $this->addSql('ALTER TABLE heist ADD CONSTRAINT FK_77E4A31F8C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id)');
        $this->addSql('ALTER TABLE heist ADD CONSTRAINT FK_77E4A31F8565851 FOREIGN KEY (establishment_id) REFERENCES establishment (id)');
        $this->addSql('ALTER TABLE heist ADD CONSTRAINT FK_77E4A31FB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE heist ADD CONSTRAINT FK_77E4A31F896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE heist_employee ADD CONSTRAINT FK_C52CE2735376E841 FOREIGN KEY (heist_id) REFERENCES heist (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE heist_employee ADD CONSTRAINT FK_C52CE2738C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE heist_forbidden_assets ADD CONSTRAINT FK_A5ED21545376E841 FOREIGN KEY (heist_id) REFERENCES heist (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE heist_forbidden_assets ADD CONSTRAINT FK_A5ED21545DA1941 FOREIGN KEY (asset_id) REFERENCES asset (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE heist_asset ADD CONSTRAINT FK_45334B725DA1941 FOREIGN KEY (asset_id) REFERENCES asset (id)');
        $this->addSql('ALTER TABLE heist_asset ADD CONSTRAINT FK_45334B7247C65C07 FOREIGN KEY (crew_member_id) REFERENCES crew_member (id)');
        $this->addSql('ALTER TABLE heist_asset ADD CONSTRAINT FK_45334B72B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE heist_asset ADD CONSTRAINT FK_45334B72896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CBB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CB896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE profile ADD CONSTRAINT FK_8157AA0FB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE profile ADD CONSTRAINT FK_8157AA0F896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT FK_794381C6A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT FK_794381C68565851 FOREIGN KEY (establishment_id) REFERENCES establishment (id)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT FK_794381C664D218E FOREIGN KEY (location_id) REFERENCES location (id)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT FK_794381C6B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT FK_794381C6896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649CCFA12B8 FOREIGN KEY (profile_id) REFERENCES profile (id)');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D6491BF8D8CE FOREIGN KEY (contractor_request_id) REFERENCES contractor_request (id)');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D6498C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id)');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE asset DROP FOREIGN KEY FK_2AF5A5C5376E841');
        $this->addSql('ALTER TABLE asset DROP FOREIGN KEY FK_2AF5A5CB03A8386');
        $this->addSql('ALTER TABLE asset DROP FOREIGN KEY FK_2AF5A5C896DBBDE');
        $this->addSql('ALTER TABLE contractor_request DROP FOREIGN KEY FK_57C594D8B03A8386');
        $this->addSql('ALTER TABLE contractor_request DROP FOREIGN KEY FK_57C594D8896DBBDE');
        $this->addSql('ALTER TABLE crew_member DROP FOREIGN KEY FK_F4D78A97A76ED395');
        $this->addSql('ALTER TABLE crew_member DROP FOREIGN KEY FK_F4D78A975376E841');
        $this->addSql('ALTER TABLE crew_member DROP FOREIGN KEY FK_F4D78A97B03A8386');
        $this->addSql('ALTER TABLE crew_member DROP FOREIGN KEY FK_F4D78A97896DBBDE');
        $this->addSql('ALTER TABLE employee DROP FOREIGN KEY FK_5D9F75A18565851');
        $this->addSql('ALTER TABLE employee DROP FOREIGN KEY FK_5D9F75A1B03A8386');
        $this->addSql('ALTER TABLE employee DROP FOREIGN KEY FK_5D9F75A1896DBBDE');
        $this->addSql('ALTER TABLE employee_time_off DROP FOREIGN KEY FK_610267EE8C03F15C');
        $this->addSql('ALTER TABLE employee_time_off DROP FOREIGN KEY FK_610267EEB03A8386');
        $this->addSql('ALTER TABLE employee_time_off DROP FOREIGN KEY FK_610267EE896DBBDE');
        $this->addSql('ALTER TABLE establishment DROP FOREIGN KEY FK_DBEFB1EEB0265DC7');
        $this->addSql('ALTER TABLE establishment DROP FOREIGN KEY FK_DBEFB1EEB03A8386');
        $this->addSql('ALTER TABLE establishment DROP FOREIGN KEY FK_DBEFB1EE896DBBDE');
        $this->addSql('ALTER TABLE heist DROP FOREIGN KEY FK_77E4A31F64D218E');
        $this->addSql('ALTER TABLE heist DROP FOREIGN KEY FK_77E4A31F8C03F15C');
        $this->addSql('ALTER TABLE heist DROP FOREIGN KEY FK_77E4A31F8565851');
        $this->addSql('ALTER TABLE heist DROP FOREIGN KEY FK_77E4A31FB03A8386');
        $this->addSql('ALTER TABLE heist DROP FOREIGN KEY FK_77E4A31F896DBBDE');
        $this->addSql('ALTER TABLE heist_employee DROP FOREIGN KEY FK_C52CE2735376E841');
        $this->addSql('ALTER TABLE heist_employee DROP FOREIGN KEY FK_C52CE2738C03F15C');
        $this->addSql('ALTER TABLE heist_forbidden_assets DROP FOREIGN KEY FK_A5ED21545376E841');
        $this->addSql('ALTER TABLE heist_forbidden_assets DROP FOREIGN KEY FK_A5ED21545DA1941');
        $this->addSql('ALTER TABLE heist_asset DROP FOREIGN KEY FK_45334B725DA1941');
        $this->addSql('ALTER TABLE heist_asset DROP FOREIGN KEY FK_45334B7247C65C07');
        $this->addSql('ALTER TABLE heist_asset DROP FOREIGN KEY FK_45334B72B03A8386');
        $this->addSql('ALTER TABLE heist_asset DROP FOREIGN KEY FK_45334B72896DBBDE');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CBB03A8386');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CB896DBBDE');
        $this->addSql('ALTER TABLE profile DROP FOREIGN KEY FK_8157AA0FB03A8386');
        $this->addSql('ALTER TABLE profile DROP FOREIGN KEY FK_8157AA0F896DBBDE');
        $this->addSql('ALTER TABLE review DROP FOREIGN KEY FK_794381C6A76ED395');
        $this->addSql('ALTER TABLE review DROP FOREIGN KEY FK_794381C68565851');
        $this->addSql('ALTER TABLE review DROP FOREIGN KEY FK_794381C664D218E');
        $this->addSql('ALTER TABLE review DROP FOREIGN KEY FK_794381C6B03A8386');
        $this->addSql('ALTER TABLE review DROP FOREIGN KEY FK_794381C6896DBBDE');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649CCFA12B8');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D6491BF8D8CE');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D6498C03F15C');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649B03A8386');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649896DBBDE');
        $this->addSql('DROP TABLE asset');
        $this->addSql('DROP TABLE contractor_request');
        $this->addSql('DROP TABLE crew_member');
        $this->addSql('DROP TABLE employee');
        $this->addSql('DROP TABLE employee_time_off');
        $this->addSql('DROP TABLE establishment');
        $this->addSql('DROP TABLE heist');
        $this->addSql('DROP TABLE heist_employee');
        $this->addSql('DROP TABLE heist_forbidden_assets');
        $this->addSql('DROP TABLE heist_asset');
        $this->addSql('DROP TABLE location');
        $this->addSql('DROP TABLE profile');
        $this->addSql('DROP TABLE review');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
