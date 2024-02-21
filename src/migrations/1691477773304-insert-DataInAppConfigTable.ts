import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertDataInAppConfigTable1691477773304 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO app_configurations (id, configurationFor, latestAppVersion, isForcefullyUpdateNeeded)
            VALUES
            ('008feee9-6101-4a19-9b56-d725af2484a1','andoid','1.0.0', false),
            ('008feee9-6101-4a19-9b56-d725af2484a2','ios', '1.0.27', false)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
