"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AppConfigurationModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigurationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const health_status_entity_1 = require("../../entity/health-status.entity");
const invitation_entity_1 = require("../../entity/invitation.entity");
const setting_entity_1 = require("../../entity/setting.entity");
const user_monitor_entity_1 = require("../../entity/user-monitor.entity");
const user_entity_1 = require("../../entity/user.entity");
const app_configuration_service_1 = require("./app-configuration.service");
const adminpanel_entity_1 = require("../../entity/adminpanel.entity");
const notification_log_entity_1 = require("../../entity/notification-log.entity");
const configuration_entity_1 = require("../../entity/configuration.entity");
const app_configuration_controller_1 = require("./app-configuration.controller");
let AppConfigurationModule = AppConfigurationModule_1 = class AppConfigurationModule {
};
AppConfigurationModule = AppConfigurationModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([adminpanel_entity_1.adminpanel, user_entity_1.Users, health_status_entity_1.HealthStatus,
                invitation_entity_1.Invitation,
                user_monitor_entity_1.UserMonitor,
                setting_entity_1.Setting,
                notification_log_entity_1.NotificationLog,
                configuration_entity_1.AppConfiguration
            ])],
        providers: [app_configuration_service_1.AppConfigurationService],
        controllers: [app_configuration_controller_1.AppConfigurationController],
        exports: [AppConfigurationModule_1]
    })
], AppConfigurationModule);
exports.AppConfigurationModule = AppConfigurationModule;
//# sourceMappingURL=app-configuration.module.js.map