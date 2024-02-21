import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUserTable1690196265407 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN isEmailSent tinyint(1) DEFAULT 0`,
        );

        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN isApprovedByAdmin tinyint(1) DEFAULT 0`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Implement the rollback for this migration, if necessary
        // For example, revert the column name back to "title"
        await queryRunner.query(
            `ALTER TABLE users remove COLUMN isEmailSent`,
        );

        await queryRunner.query(
            `ALTER TABLE users remove COLUMN isApprovedByAdmin`,
        );
    }

}
