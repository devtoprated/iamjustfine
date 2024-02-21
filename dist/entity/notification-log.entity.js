"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationLog = void 0;
const typeorm_1 = require("typeorm");
const shared_entity_1 = require("./shared.entity");
const user_entity_1 = require("./user.entity");
let NotificationLog = class NotificationLog extends shared_entity_1.SharedEntity {
};
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], NotificationLog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], NotificationLog.prototype, "fromUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], NotificationLog.prototype, "toUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], NotificationLog.prototype, "notificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null, type: 'text' }),
    __metadata("design:type", String)
], NotificationLog.prototype, "payloadDetail", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], NotificationLog.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationLog.prototype, "isMainFunctionLog", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationLog.prototype, "isSystemNotification", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "fromUserId" }),
    __metadata("design:type", user_entity_1.Users)
], NotificationLog.prototype, "fromUser", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "toUserId" }),
    __metadata("design:type", user_entity_1.Users)
], NotificationLog.prototype, "toUser", void 0);
NotificationLog = __decorate([
    (0, typeorm_1.Entity)('notification_logs')
], NotificationLog);
exports.NotificationLog = NotificationLog;
//# sourceMappingURL=notification-log.entity.js.map