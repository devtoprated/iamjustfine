import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class AppConfigurations1691218527747 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(new Table({
            name: 'app_configurations',
            columns: [
                {
                    name: 'id',
                    type: "varchar",
                    isPrimary: true,
                    isUnique: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'configurationFor',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: 'latestAppVersion',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: 'isForcefullyUpdateNeeded',
                    type: 'tinyint',
                    length: '1',
                    default: false,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    isNullable: false,
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    isNullable: false,
                },
                {
                    name: 'deletedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
