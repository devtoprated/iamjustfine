"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt_constants_1 = require("../config/jwt-constants");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entity/user.entity");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const otp_entity_1 = require("../entity/otp.entity");
const users_service_1 = require("../users/users.service");
const local_auth_1 = require("./local.auth");
const jwt_2 = require("@nestjs/jwt");
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
const subscription_entity_1 = require("../entity/subscription.entity");
let AuthModule = AuthModule_1 = class AuthModule {
};
AuthModule = AuthModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.Users, otp_entity_1.Otp, setting_entity_1.Setting, invitation_entity_1.Invitation, setting_entity_1.Setting,
                health_status_entity_1.HealthStatus, passport_1.PassportModule, notification_entity_1.Notification, user_monitor_entity_1.UserMonitor,
                user_token_entity_1.UserToken, notification_log_entity_1.NotificationLog, plans_entity_1.Plans, multipleUserSubscription_entity_1.MultipleUserSubscription, subscription_entity_1.Subscription
            ]),
            jwt_1.JwtModule.register({
                secret: jwt_constants_1.jwtConstants.secret,
                signOptions: { expiresIn: '360d' },
            }),
        ],
        providers: [auth_service_1.AuthService, users_service_1.UsersService, local_auth_1.LocalStrategy, jwt_2.JwtService, notification_service_1.NotificationService],
        exports: [AuthModule_1],
        controllers: [auth_controller_1.AuthController],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map