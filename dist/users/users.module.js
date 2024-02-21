"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const user_entity_1 = require("../entity/user.entity");
const otp_entity_1 = require("../entity/otp.entity");
const typeorm_1 = require("@nestjs/typeorm");
const auth_service_1 = require("../auth/auth.service");
const jwt_1 = require("@nestjs/jwt");
const health_status_entity_1 = require("../entity/health-status.entity");
const invitation_entity_1 = require("../entity/invitation.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_entity_1 = require("../entity/notification.entity");
const user_monitor_entity_1 = require("../entity/user-monitor.entity");
const setting_entity_1 = require("../entity/setting.entity");
const user_token_entity_1 = require("../entity/user-token.entity");
const notification_log_entity_1 = require("../entity/notification-log.entity");
const plans_entity_1 = require("../entity/plans.entity");
const multipleUserSubscription_entity_1 = require("../entity/multipleUserSubscription.entity");
const stripe_service_1 = require("../utilities/stripe.service");
const subscription_entity_1 = require("../entity/subscription.entity");
const subscription_service_1 = require("../subscription/subscription.service");
let UserModule = class UserModule {
};
UserModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.Users, otp_entity_1.Otp, health_status_entity_1.HealthStatus, invitation_entity_1.Invitation, notification_entity_1.Notification, user_monitor_entity_1.UserMonitor, setting_entity_1.Setting, user_token_entity_1.UserToken, notification_log_entity_1.NotificationLog, plans_entity_1.Plans, multipleUserSubscription_entity_1.MultipleUserSubscription, subscription_entity_1.Subscription])],
        providers: [users_service_1.UsersService, auth_service_1.AuthService, jwt_1.JwtService, notification_service_1.NotificationService, stripe_service_1.StripeService, subscription_service_1.SubscriptionService, {
                provide: 'STRIPE_KEY',
                useValue: process.env.STRIPE_SECRET_KEY,
            }],
        controllers: [users_controller_1.UsersController],
        exports: [users_service_1.UsersService, auth_service_1.AuthService, jwt_1.JwtService, notification_service_1.NotificationService, stripe_service_1.StripeService, subscription_service_1.SubscriptionService],
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=users.module.js.map