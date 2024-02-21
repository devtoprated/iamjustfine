"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OtpModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpModule = void 0;
const common_1 = require("@nestjs/common");
const otp_service_1 = require("./otp.service");
const otp_controller_1 = require("./otp.controller");
const user_entity_1 = require("../entity/user.entity");
const otp_entity_1 = require("../entity/otp.entity");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const jwt_constants_1 = require("../config/jwt-constants");
const auth_service_1 = require("../auth/auth.service");
const setting_entity_1 = require("../entity/setting.entity");
const user_token_entity_1 = require("../entity/user-token.entity");
const notification_entity_1 = require("../entity/notification.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_log_entity_1 = require("../entity/notification-log.entity");
const configuration_entity_1 = require("../entity/configuration.entity");
let OtpModule = OtpModule_1 = class OtpModule {
};
OtpModule = OtpModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [otp_service_1.OtpService, auth_service_1.AuthService, notification_service_1.NotificationService],
        controllers: [otp_controller_1.OtpController],
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.Users, otp_entity_1.Otp, setting_entity_1.Setting, user_token_entity_1.UserToken, notification_entity_1.Notification, notification_log_entity_1.NotificationLog, configuration_entity_1.AppConfiguration]),
            jwt_1.JwtModule.register({
                secret: jwt_constants_1.jwtConstants.secret,
                signOptions: { expiresIn: '360d' },
            })],
        exports: [OtpModule_1]
    })
], OtpModule);
exports.OtpModule = OtpModule;
//# sourceMappingURL=otp.module.js.map