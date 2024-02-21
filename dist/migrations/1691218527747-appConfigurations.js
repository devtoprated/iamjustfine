"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigurations1691218527747 = void 0;
const typeorm_1 = require("typeorm");
class AppConfigurations1691218527747 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
    async down(queryRunner) {
    }
}
exports.AppConfigurations1691218527747 = AppConfigurations1691218527747;
//# sourceMappingURL=1691218527747-appConfigurations.js.map