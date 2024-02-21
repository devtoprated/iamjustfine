"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const user_entity_1 = require("./entity/user.entity");
const otp_entity_1 = require("./entity/otp.entity");
const otp_module_1 = require("./otp/otp.module");
const health_status_entity_1 = require("./entity/health-status.entity");
const notification_module_1 = require("./notification/notification.module");
const invitation_entity_1 = require("./entity/invitation.entity");
const invitation_module_1 = require("./invitation/invitation.module");
const notification_entity_1 = require("./entity/notification.entity");
const user_monitor_module_1 = require("./user-monitor/user-monitor.module");
const user_monitor_entity_1 = require("./entity/user-monitor.entity");
const setting_entity_1 = require("./entity/setting.entity");
const subscription_entity_1 = require("./entity/subscription.entity");
const setting_module_1 = require("./setting/setting.module");
const schedule_1 = require("@nestjs/schedule");
const user_token_entity_1 = require("./entity/user-token.entity");
const notification_log_entity_1 = require("./entity/notification-log.entity");
const email_module_1 = require("./email/email.module");
const admin_module_1 = require("./admin/admin.module");
const adminpanel_entity_1 = require("./entity/adminpanel.entity");
const configuration_entity_1 = require("./entity/configuration.entity");
const plans_entity_1 = require("./entity/plans.entity");
const app_configuration_module_1 = require("./admin/app-configuration/app-configuration.module");
const admin_seeder_service_1 = require("./admin-seeder/admin-seeder.service");
const subscription_module_1 = require("./subscription/subscription.module");
const webhook_module_1 = require("./webhook/webhook.module");
const multipleUserSubscription_entity_1 = require("./entity/multipleUserSubscription.entity");
const envModule = config_1.ConfigModule.forRoot({
    isGlobal: true,
});
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([adminpanel_entity_1.adminpanel]),
            envModule,
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                entities: [user_entity_1.Users, otp_entity_1.Otp, health_status_entity_1.HealthStatus, invitation_entity_1.Invitation,
                    notification_entity_1.Notification, user_monitor_entity_1.UserMonitor, setting_entity_1.Setting,
                    user_token_entity_1.UserToken, notification_log_entity_1.NotificationLog, adminpanel_entity_1.adminpanel,
                    configuration_entity_1.AppConfiguration, plans_entity_1.Plans, subscription_entity_1.Subscription, multipleUserSubscription_entity_1.MultipleUserSubscription
                ],
                migrations: ['dist/**/migrations/*.js'],
                migrationsTableName: "migrations",
                migrationsRun: true,
                synchronize: false,
                logging: true
            }),
            auth_module_1.AuthModule,
            users_module_1.UserModule,
            otp_module_1.OtpModule,
            notification_module_1.NotificationModule,
            invitation_module_1.InvitationModule,
            user_monitor_module_1.UserMonitorModule,
            setting_module_1.SettingModule,
            email_module_1.EmailModule,
            admin_module_1.AdminModule,
            app_configuration_module_1.AppConfigurationModule,
            subscription_module_1.SubscriptionModule,
            webhook_module_1.WebhookModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, admin_seeder_service_1.AdminSeederService],
        exports: [app_service_1.AppService]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map