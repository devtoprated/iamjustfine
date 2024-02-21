"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPanelTable1690457554189 = void 0;
const typeorm_1 = require("typeorm");
class AdminPanelTable1690457554189 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'adminpanel',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'username',
                    type: 'varchar',
                    length: '50',
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'password',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
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
            ],
        }));
    }
    async down(queryRunner) {
    }
}
exports.AdminPanelTable1690457554189 = AdminPanelTable1690457554189;
//# sourceMappingURL=1690457554189-admin_panel_table.js.map