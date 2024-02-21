"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertDataInAppConfigTable1691477773304 = void 0;
class InsertDataInAppConfigTable1691477773304 {
    async up(queryRunner) {
        await queryRunner.query(`
            INSERT INTO app_configurations (id, configurationFor, latestAppVersion, isForcefullyUpdateNeeded)
            VALUES
            ('008feee9-6101-4a19-9b56-d725af2484a1','andoid','1.0.0', false),
            ('008feee9-6101-4a19-9b56-d725af2484a2','ios', '1.0.27', false)
        `);
    }
    async down(queryRunner) {
    }
}
exports.InsertDataInAppConfigTable1691477773304 = InsertDataInAppConfigTable1691477773304;
//# sourceMappingURL=1691477773304-insert-DataInAppConfigTable.js.map