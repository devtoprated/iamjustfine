"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertDataIntoAdminTable1690459731624 = void 0;
class InsertDataIntoAdminTable1690459731624 {
    async up(queryRunner) {
        await queryRunner.query(`
            INSERT INTO adminpanel (id, username, password)
            VALUES
            ('00572b5a-dc86-4faf-9f4d-1713c372635d','admin@iamjustfine.com', '$2a$10$kxn4MP36O3ulqe8c0qlpd.UvWi6Ffq0.vFiEpVsP2Agcb1BNCOvta')
        `);
    }
    async down(queryRunner) {
    }
}
exports.InsertDataIntoAdminTable1690459731624 = InsertDataIntoAdminTable1690459731624;
//# sourceMappingURL=1690459731624-InsertDataIntoAdminTable.js.map