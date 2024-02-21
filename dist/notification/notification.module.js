"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const typeorm_1 = require("@nestjs/typeorm");
const otp_entity_1 = require("../entity/otp.entity");
const user_entity_1 = require("../entity/user.entity");
const health_status_entity_1 = require("../entity/health-status.entity");
const notification_controller_1 = require("./notification.controller");
const notification_entity_1 = require("../entity/notification.entity");
const jwt_1 = require("@nestjs/jwt");
const user_token_entity_1 = require("../entity/user-token.entity");
const notification_log_entity_1 = require("../entity/notification-log.entity");
let NotificationModule = NotificationModule_1 = class NotificationModule {
};
NotificationModule = NotificationModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [notification_service_1.NotificationService, jwt_1.JwtService],
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.Users, otp_entity_1.Otp, health_status_entity_1.HealthStatus, notification_entity_1.Notification, user_token_entity_1.UserToken, notification_log_entity_1.NotificationLog])],
        controllers: [notification_controller_1.NotificationController],
        exports: [NotificationModule_1]
    })
], NotificationModule);
exports.NotificationModule = NotificationModule;
//# sourceMappingURL=notification.module.js.map