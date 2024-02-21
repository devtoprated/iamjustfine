"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationModule = void 0;
const common_1 = require("@nestjs/common");
const invitation_service_1 = require("./invitation.service");
const invitation_controller_1 = require("./invitation.controller");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entity/user.entity");
const jwt_1 = require("@nestjs/jwt");
const invitation_entity_1 = require("../entity/invitation.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_entity_1 = require("../entity/notification.entity");
const user_token_entity_1 = require("../entity/user-token.entity");
const notification_log_entity_1 = require("../entity/notification-log.entity");
let InvitationModule = class InvitationModule {
};
InvitationModule = __decorate([
    (0, common_1.Module)({
        providers: [invitation_service_1.InvitationService, jwt_1.JwtService, notification_service_1.NotificationService],
        controllers: [invitation_controller_1.InvitationController],
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.Users, invitation_entity_1.Invitation, notification_entity_1.Notification, user_token_entity_1.UserToken, notification_log_entity_1.NotificationLog])]
    })
], InvitationModule);
exports.InvitationModule = InvitationModule;
//# sourceMappingURL=invitation.module.js.map