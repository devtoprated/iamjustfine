"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AdminModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const health_status_entity_1 = require("../entity/health-status.entity");
const invitation_entity_1 = require("../entity/invitation.entity");
const setting_entity_1 = require("../entity/setting.entity");
const user_monitor_entity_1 = require("../entity/user-monitor.entity");
const user_entity_1 = require("../entity/user.entity");
const notification_service_1 = require("../notification/notification.service");
const stripe_service_1 = require("../utilities/stripe.service");
const users_service_1 = require("../users/users.service");
const admin_service_1 = require("./admin.service");
const admin_controller_1 = require("./admin.controller");
const adminpanel_entity_1 = require("../entity/adminpanel.entity");
const notification_entity_1 = require("../entity/notification.entity");
const notification_log_entity_1 = require("../entity/notification-log.entity");
const subscription_entity_1 = require("../entity/subscription.entity");
const multipleUserSubscription_entity_1 = require("../entity/multipleUserSubscription.entity");
const plans_entity_1 = require("../entity/plans.entity");
let AdminModule = AdminModule_1 = class AdminModule {
};
AdminModule = AdminModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([adminpanel_entity_1.adminpanel, user_entity_1.Users, health_status_entity_1.HealthStatus, plans_entity_1.Plans,
                invitation_entity_1.Invitation,
                user_monitor_entity_1.UserMonitor,
                notification_entity_1.Notification,
                setting_entity_1.Setting,
                notification_log_entity_1.NotificationLog,
                subscription_entity_1.Subscription,
                multipleUserSubscription_entity_1.MultipleUserSubscription
            ])],
        providers: [{
                provide: 'STRIPE_KEY',
                useValue: process.env.STRIPE_SECRET_KEY,
            }, stripe_service_1.StripeService, admin_service_1.AdminService, users_service_1.UsersService, notification_service_1.NotificationService],
        controllers: [admin_controller_1.AdminController],
        exports: [AdminModule_1]
    })
], AdminModule);
exports.AdminModule = AdminModule;
//# sourceMappingURL=admin.module.js.map