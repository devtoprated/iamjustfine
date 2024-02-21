"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlterUserTable1690196265407 = void 0;
class AlterUserTable1690196265407 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE users ADD COLUMN isEmailSent tinyint(1) DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE users ADD COLUMN isApprovedByAdmin tinyint(1) DEFAULT 0`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE users remove COLUMN isEmailSent`);
        await queryRunner.query(`ALTER TABLE users remove COLUMN isApprovedByAdmin`);
    }
}
exports.AlterUserTable1690196265407 = AlterUserTable1690196265407;
//# sourceMappingURL=1690196265407-alter_user_table.js.map