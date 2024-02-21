import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertDataIntoAdminTable1690459731624 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            INSERT INTO adminpanel (id, username, password)
            VALUES
            ('00572b5a-dc86-4faf-9f4d-1713c372635d','admin@iamjustfine.com', '$2a$10$kxn4MP36O3ulqe8c0qlpd.UvWi6Ffq0.vFiEpVsP2Agcb1BNCOvta')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }

}
